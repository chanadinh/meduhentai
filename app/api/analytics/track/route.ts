import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Visitor from '@/models/Visitor';
import { getClientIP, getDeviceInfo, shouldTrackVisitor } from '@/lib/visitor-utils';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { page, referrer } = await request.json();
    const userAgent = request.headers.get('user-agent') || '';
    const ip = getClientIP(request);
    
    // Don't track if it's a bot or invalid request
    if (!shouldTrackVisitor(userAgent)) {
      return NextResponse.json({ success: true, message: 'Bot detected, not tracking' });
    }
    
    // Get device information
    const deviceInfo = getDeviceInfo(userAgent);
    
    // Check if this IP has been seen before
    let visitor = await Visitor.findOne({ ip });
    
    if (visitor) {
      // Update existing visitor
      visitor.visitCount += 1;
      visitor.lastVisit = new Date();
      visitor.userAgent = userAgent; // Update user agent in case it changed
      
      // Add page to pages viewed if not already there
      if (page && !visitor.pagesViewed.includes(page)) {
        visitor.pagesViewed.push(page);
      }
      
      // Update device info if it changed
      if (deviceInfo.browser) visitor.browser = deviceInfo.browser;
      if (deviceInfo.os) visitor.os = deviceInfo.os;
      visitor.deviceType = deviceInfo.deviceType;
      
      await visitor.save();
    } else {
      // Create new visitor
      visitor = new Visitor({
        ip,
        userAgent,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        pagesViewed: page ? [page] : [],
        referrer: referrer || request.headers.get('referer') || undefined,
        firstVisit: new Date(),
        lastVisit: new Date(),
        visitCount: 1,
        isUnique: true
      });
      
      await visitor.save();
    }
    
    return NextResponse.json({ 
      success: true, 
      visitorId: visitor._id,
      isNewVisitor: visitor.visitCount === 1
    });
    
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track visitor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get basic analytics
    const totalVisitors = await Visitor.countDocuments();
    const uniqueVisitors = await Visitor.countDocuments({ isUnique: true });
    const todayVisitors = await Visitor.countDocuments({
      lastVisit: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    
    // Get device type distribution
    const deviceStats = await Visitor.aggregate([
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get browser distribution
    const browserStats = await Visitor.aggregate([
      {
        $group: {
          _id: '$browser',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get recent visitors
    const recentVisitors = await Visitor.find()
      .sort({ lastVisit: -1 })
      .limit(10)
      .select('ip deviceType browser lastVisit visitCount')
      .lean();
    
    return NextResponse.json({
      success: true,
      analytics: {
        totalVisitors,
        uniqueVisitors,
        todayVisitors,
        deviceStats,
        browserStats,
        recentVisitors
      }
    });
    
  } catch (error) {
    console.error('Error getting analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get analytics' },
      { status: 500 }
    );
  }
}
