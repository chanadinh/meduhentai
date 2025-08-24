# Hentai Tags System

This document describes the comprehensive tags system implemented for the Meduhentai web application, based on popular hentai tags from various sources including [ahegao.online](https://ahegao.online/all-hentai-tags/).

## Overview

The tags system provides a comprehensive categorization system for manga content, allowing users to:
- Browse manga by specific tags and genres
- Search for content based on preferences
- Filter content by multiple criteria
- Discover new content through tag-based recommendations

## Tag Categories

### Core Hentai Tags (Based on ahegao.online)

#### A
- **Ahegao** - Facial expressions during sexual activity
- **Anal** - Anal intercourse content
- **Anime** - Anime-style artwork

#### B
- **BDSM** - Bondage, discipline, sadism, and masochism
- **Beach** - Beach or seaside settings
- **Big Dick** - Content featuring large genitalia
- **Bikini** - Bikini-clad characters
- **Blindfold** - Blindfolded characters
- **Blonde** - Blonde-haired characters
- **Bondage** - Restraint and bondage content
- **Bukkake** - Multiple male climax content
- **Bunny Costume** - Bunny girl outfits

#### C
- **Cheating** - Infidelity content
- **Cheating Behind Door** - Hidden infidelity
- **Chikan** - Molestation content
- **Chubby** - Plus-sized characters
- **Cosplay** - Costume play content
- **Costume** - Various costume themes

#### D
- **Deepthroat** - Deep oral content
- **Demon** - Demon characters
- **Dildo** - Sex toy content

#### E
- **Ebony** - Dark-skinned characters
- **Elbow Gloves** - Long glove accessories
- **Electrocution** - Electric stimulation
- **Elf** - Elf characters
- **Enema** - Enema content
- **Exhibitionist** - Public exposure content

#### F
- **Fat** - Overweight characters
- **Femdom** - Female dominance
- **Fisting** - Fisting content
- **Flatchest** - Small-breasted characters
- **Footjob** - Foot stimulation
- **Futa** - Female with male genitalia
- **Futanari** - Hermaphrodite characters

#### G
- **Gangbang** - Multiple partner content
- **Gape** - Stretching content
- **Glasses** - Characters wearing glasses
- **Glory Hole** - Glory hole scenarios
- **Gyaru** - Gyaru fashion style

#### H
- **Handjob** - Manual stimulation
- **Harem** - Multiple love interests
- **Huge Ass** - Large posterior content
- **Huge Breast** - Large breast content
- **Huge Dick** - Large genitalia content

#### I
- **Incest** - Family relationship content

#### L
- **Lady Suit** - Formal women's clothing
- **Latex** - Latex clothing
- **Legwear** - Stockings, tights, etc.
- **Lesbian** - Female-female content

#### M
- **Maid** - Maid outfit content
- **Masturbation** - Self-stimulation
- **MILF** - Mother figure content
- **Mind Break** - Psychological breakdown
- **Mind Control** - Hypnosis and control
- **Mother** - Maternal content
- **Mother and Daughter** - Family content

#### N
- **Nerd** - Intellectual character types
- **NTR** - Netorare (cuckold) content

#### O
- **Oral** - Oral stimulation
- **Orc** - Orc characters
- **Orgasm** - Climax content
- **Orgy** - Group activity

#### P
- **Pantyhose** - Pantyhose content
- **Petplay** - Pet roleplay
- **Piercing** - Body piercings
- **Piss** - Urination content
- **Pregnant** - Pregnancy content
- **Princess** - Royal character types
- **Prolapse** - Prolapse content
- **Prostitution** - Sex work content
- **Public** - Public setting content
- **Public Toilet** - Bathroom content
- **Public Vibrator** - Public toy use

#### S
- **Sex Toys** - Adult toy content
- **Short Hair** - Short-haired characters
- **Sister** - Sibling content
- **Slave** - Slavery content
- **Slut** - Promiscuous characters
- **Slut Dress** - Provocative clothing
- **Squirt** - Female ejaculation
- **Stomach Bulge** - Pregnancy-like content
- **Swimsuit** - Swimwear content

#### T
- **Tail** - Animal tail content
- **Tan** - Tanned skin
- **Tan Lines** - Tan line content
- **Tattoo** - Tattooed characters
- **Teacher** - Educational setting
- **Tentacles** - Tentacle content
- **Tomboy** - Masculine female characters
- **Train** - Train setting
- **Trap** - Cross-dressing characters

#### U
- **Uncensored** - Uncensored content

#### V
- **Vanilla** - Standard content
- **Vibrator** - Vibrator content

#### W
- **Warrior** - Warrior characters
- **Wife** - Married character content

#### Y
- **Yuri** - Female-female romance

### Additional Popular Tags

#### Content Types
- **School** - Educational settings
- **Office** - Workplace settings
- **Nurse** - Medical professional content
- **Doctor** - Healthcare settings
- **Police** - Law enforcement
- **Military** - Armed forces content

#### Genres
- **Fantasy** - Fantasy worlds
- **Sci-Fi** - Science fiction
- **Historical** - Period settings
- **Modern** - Contemporary settings
- **Romance** - Love stories
- **Drama** - Dramatic content
- **Comedy** - Humorous content
- **Action** - Action-packed content
- **Adventure** - Adventure stories
- **Horror** - Scary content
- **Mystery** - Mystery elements
- **Slice of Life** - Everyday life

#### Character Types
- **Vampire** - Vampire characters
- **Werewolf** - Lycanthrope content
- **Angel** - Angelic beings
- **Devil** - Demonic content
- **Ghost** - Spirit content
- **Zombie** - Undead content
- **Robot** - Mechanical beings
- **Android** - Artificial humans
- **Monster** - Monster characters
- **Dragon** - Dragon content

#### Physical Attributes
- **Body Types**: Slim, Athletic, Curvy, Plus Size, Tall, Short, Petite, Voluptuous
- **Hair Colors**: Black, Brown, Blonde, Red, Blue, Green, Purple, Pink, White, Gray
- **Hair Styles**: Long, Short, Twin Tails, Ponytail, Bob Cut, Pixie Cut, Undercut, Mullet, Afro, Dreadlocks
- **Eye Colors**: Brown, Blue, Green, Hazel, Gray, Amber, Violet, Heterochromia
- **Skin Tones**: Fair, Tan, Dark, Olive, Pale, Freckles, Moles, Birthmarks

#### Personality Traits
- **Shy**, **Bold**, **Aggressive**, **Submissive**, **Dominant**, **Masochist**, **Sadist**, **Switch**
- **Tsundere**, **Yandere**, **Kuudere**, **Dandere**, **Genki**

## Technical Implementation

### Database Schema

The tags system is implemented using MongoDB with the following structure:

```typescript
interface IManga {
  // ... other fields
  genres: string[];  // Primary categorization
  tags: string[];    // Secondary categorization
}
```

### API Endpoints

#### GET `/api/admin/tags`
- Fetches all tags and genres with usage counts
- Requires admin authentication
- Returns aggregated data from manga documents

#### POST `/api/admin/tags`
- Adds new tags or genres
- Requires admin authentication
- Validates tag/genre names

#### DELETE `/api/admin/tags`
- Removes tags or genres from all manga
- Requires admin authentication
- Updates all affected manga documents

### Admin Interface

The admin interface provides:
- **Statistics Dashboard**: Total tags, genres, and items
- **Search and Filter**: Find specific tags by name or type
- **Add New Tags**: Create new tags and genres
- **Delete Tags**: Remove tags with confirmation
- **Alphabetical Organization**: Tags grouped by first letter
- **Usage Counts**: Shows how many manga use each tag

### Tag Population Script

The `scripts/populate-hentai-tags.js` script:
- Connects to MongoDB
- Populates the database with comprehensive tags
- Creates sample manga if none exist
- Adds random tags to existing manga
- Provides statistics on tag usage

## Usage

### For Users
1. Browse manga by selecting tags from the interface
2. Search for specific content using tag combinations
3. Discover new content through tag-based recommendations

### For Administrators
1. Access the admin panel at `/admin/tags`
2. View current tag usage statistics
3. Add new tags and genres as needed
4. Remove outdated or inappropriate tags
5. Monitor tag popularity and usage

### For Developers
1. Use the tags API for custom implementations
2. Extend the tag system with new categories
3. Implement tag-based search and filtering
4. Create tag-based recommendation systems

## Best Practices

### Tag Naming
- Use clear, descriptive names
- Maintain consistency in capitalization
- Avoid overly specific or redundant tags
- Use English terms for international accessibility

### Tag Organization
- Separate primary genres from secondary tags
- Group related tags logically
- Maintain alphabetical organization
- Regular cleanup of unused tags

### Content Moderation
- Review new tags before approval
- Monitor tag usage for inappropriate content
- Regular audit of existing tags
- Community feedback integration

## Future Enhancements

### Planned Features
- Tag popularity tracking
- User-generated tags
- Tag-based recommendations
- Tag analytics and insights
- Tag translation support
- Tag hierarchy and relationships

### Technical Improvements
- Tag caching for performance
- Tag search optimization
- Tag suggestion system
- Tag validation rules
- Tag import/export functionality

## Contributing

To add new tags or improve the system:
1. Review existing tags for duplicates
2. Follow naming conventions
3. Test with sample content
4. Update documentation
5. Submit for review

## Support

For questions or issues with the tags system:
- Check the admin interface for current status
- Review tag usage statistics
- Consult the API documentation
- Contact the development team

---

*This tags system is designed to provide comprehensive content categorization while maintaining user privacy and content appropriateness. All tags are subject to content moderation and community guidelines.*
