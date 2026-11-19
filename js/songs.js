(function (global) {
  'use strict';

  var NS = (global.OrbitalFifths = global.OrbitalFifths || {});
  var Theory = NS.Theory;

  const SONG_DB = [
    {
      "id": "let-it-be",
      "title": "Let It Be",
      "artist": "The Beatles",
      "year": 1970,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 72,
      "originalKey": "C",
      "chords": ["C", "G", "Am", "F"],
      "insight": "Classic I–V–vi–IV descent; the melody rests on E and C over Fmaj7 warmth."
    },
    {
      "id": "dont-stop-believin",
      "title": "Don't Stop Believin'",
      "artist": "Journey",
      "year": 1981,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 119,
      "originalKey": "E",
      "chords": ["E", "B", "C#m", "A"],
      "insight": "Driving eighth-note piano ostinato turns I–V–vi–IV into an unstoppable anthem."
    },
    {
      "id": "with-or-without-you",
      "title": "With or Without You",
      "artist": "U2",
      "year": 1987,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 110,
      "originalKey": "D",
      "chords": ["D", "A", "Bm", "G"],
      "insight": "Unchanging 4-chord loop lets dynamic vocal phrasing and bass build all tension."
    },
    {
      "id": "someone-like-you",
      "title": "Someone Like You",
      "artist": "Adele",
      "year": 2011,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 68,
      "originalKey": "A",
      "chords": ["A", "E", "F#m", "D"],
      "insight": "Broken piano arpeggios emphasize the major 3rd and soaring octave leaps in the chorus."
    },
    {
      "id": "no-woman-no-cry",
      "title": "No Woman, No Cry",
      "artist": "Bob Marley & The Wailers",
      "year": 1974,
      "genre": "R&B / Soul",
      "section": "Chorus",
      "bpm": 78,
      "originalKey": "C",
      "chords": ["C", "G", "Am", "F"],
      "insight": "Passing bass walk C–G/B–Am–F softens the transition into the minor vi."
    },
    {
      "id": "take-on-me-chorus",
      "title": "Take On Me",
      "artist": "a-ha",
      "year": 1985,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 169,
      "originalKey": "A",
      "chords": ["A", "E", "F#m", "D"],
      "insight": "High-register falsetto melody leaps above a bright I–V–vi–IV synth progression."
    },
    {
      "id": "she-will-be-loved",
      "title": "She Will Be Loved",
      "artist": "Maroon 5",
      "year": 2002,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 102,
      "originalKey": "Eb",
      "chords": ["Eb", "Bb", "Cm", "Ab"],
      "insight": "Syncopated vocal hook locks onto the 3rd of each chord on downbeats."
    },
    {
      "id": "demons",
      "title": "Demons",
      "artist": "Imagine Dragons",
      "year": 2012,
      "genre": "Indie / Alt",
      "section": "Chorus",
      "bpm": 90,
      "originalKey": "Eb",
      "chords": ["Eb", "Bb", "Cm", "Ab"],
      "insight": "Half-time snare weight pairs with wide open fifths for arena scale."
    },
    {
      "id": "when-i-come-around",
      "title": "When I Come Around",
      "artist": "Green Day",
      "year": 1994,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 98,
      "originalKey": "F#",
      "chords": ["F#", "C#", "D#m", "B"],
      "insight": "Palm-muted power chords outline I–V–vi–IV with punchy punk simplicity."
    },
    {
      "id": "im-yours",
      "title": "I'm Yours",
      "artist": "Jason Mraz",
      "year": 2008,
      "genre": "Folk / Country",
      "section": "Main Loop",
      "bpm": 151,
      "originalKey": "B",
      "chords": ["B", "F#", "G#m", "E"],
      "insight": "Reggae-folk offbeat strums give relaxed bounce to the I–V–vi–IV turnaround."
    },
    {
      "id": "wagon-wheel",
      "title": "Wagon Wheel",
      "artist": "Old Crow Medicine Show",
      "year": 2004,
      "genre": "Folk / Country",
      "section": "Main Loop",
      "bpm": 148,
      "originalKey": "A",
      "chords": ["A", "E", "F#m", "D"],
      "insight": "Alternating endings (I–V–vi–IV then I–V–IV) create an 8-bar folk call-and-response."
    },
    {
      "id": "under-the-bridge-chorus",
      "title": "Under the Bridge",
      "artist": "Red Hot Chili Peppers",
      "year": 1991,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 84,
      "originalKey": "E",
      "chords": ["E", "B", "C#m", "A"],
      "insight": "Hendrix-inspired hammer-on fills embellish standard major and minor triads."
    },
    {
      "id": "can-you-feel-the-love",
      "title": "Can You Feel the Love Tonight",
      "artist": "Elton John",
      "year": 1994,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 124,
      "originalKey": "Bb",
      "chords": ["Bb", "F", "Gm", "Eb"],
      "insight": "Warm gospel piano suspensions resolve cleanly across the I–V–vi–IV ballad frame."
    },
    {
      "id": "beasts-of-burden",
      "title": "Beast of Burden",
      "artist": "The Rolling Stones",
      "year": 1978,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 100,
      "originalKey": "E",
      "chords": ["E", "B", "C#m", "A"],
      "insight": "Interlocking dual guitars voice-lead smoothly around E and B pedal tones."
    },
    {
      "id": "country-roads-chorus",
      "title": "Take Me Home, Country Roads",
      "artist": "John Denver",
      "year": 1971,
      "genre": "Folk / Country",
      "section": "Chorus",
      "bpm": 82,
      "originalKey": "A",
      "chords": ["A", "E", "F#m", "D"],
      "insight": "Singalong chorus starts straight on I and climbs to high E on the hook."
    },
    {
      "id": "poker-face-chorus",
      "title": "Poker Face",
      "artist": "Lady Gaga",
      "year": 2008,
      "genre": "Electronic / Dance",
      "section": "Chorus",
      "bpm": 119,
      "originalKey": "G#m",
      "chords": ["G#m", "E", "B", "F#"],
      "insight": "Starting on vi (G#m) flips the mood of the 4-chord loop into dark synth-pop."
    },
    {
      "id": "africa-chorus",
      "title": "Africa",
      "artist": "Toto",
      "year": 1982,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 93,
      "originalKey": "A",
      "chords": ["F#m", "D", "A", "E"],
      "insight": "Chorus modulates to A major via vi–IV–I–V, creating sudden harmonic sunrise."
    },
    {
      "id": "zombie",
      "title": "Zombie",
      "artist": "The Cranberries",
      "year": 1994,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 84,
      "originalKey": "Em",
      "chords": ["Em", "C", "G", "D"],
      "insight": "Heavy vi–IV–I–V loop gains urgency from the insistent 5th-degree pedal melody."
    },
    {
      "id": "numb",
      "title": "Numb",
      "artist": "Linkin Park",
      "year": 2003,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 110,
      "originalKey": "F#m",
      "chords": ["F#m", "D", "A", "E"],
      "insight": "Minor-centered vi–IV–I–V pairs angsty vocal intervals with soaring major lift."
    },
    {
      "id": "save-tonight",
      "title": "Save Tonight",
      "artist": "Eagle-Eye Cherry",
      "year": 1997,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 120,
      "originalKey": "Am",
      "chords": ["Am", "F", "C", "G"],
      "insight": "Nonstop Am–F–C–G acoustic strum relies on groove dynamics for verse/chorus contrast."
    },
    {
      "id": "halo",
      "title": "Halo",
      "artist": "Beyoncé",
      "year": 2008,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 80,
      "originalKey": "A",
      "chords": ["A", "Bm", "F#m", "D"],
      "insight": "Substituting ii (Bm) for V creates a soulful, yearning ascent into the chorus."
    },
    {
      "id": "despacito",
      "title": "Despacito",
      "artist": "Luis Fonsi & Daddy Yankee",
      "year": 2017,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 89,
      "originalKey": "Bm",
      "chords": ["Bm", "G", "D", "A"],
      "insight": "Latin pop dembow groove energizes the classic vi–IV–I–V progression."
    },
    {
      "id": "if-i-were-a-boy",
      "title": "If I Were a Boy",
      "artist": "Beyoncé",
      "year": 2008,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 90,
      "originalKey": "F#m",
      "chords": ["F#m", "D", "A", "E"],
      "insight": "Slow ballad tempo spotlights subtle vocal runs over vi–IV–I–V."
    },
    {
      "id": "what-about-us",
      "title": "What About Us",
      "artist": "P!nk",
      "year": 2017,
      "genre": "Electronic / Dance",
      "section": "Chorus",
      "bpm": 114,
      "originalKey": "F#m",
      "chords": ["F#m", "D", "A", "E"],
      "insight": "Four-on-the-floor kick pulse builds from intimate vi to anthemic I–V release."
    },
    {
      "id": "apologize",
      "title": "Apologize",
      "artist": "OneRepublic",
      "year": 2007,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 118,
      "originalKey": "Cm",
      "chords": ["Cm", "Ab", "Eb", "Bb"],
      "insight": "Spare piano stabs over Cm–Ab–Eb–Bb frame dramatic string swells."
    },
    {
      "id": "grenade",
      "title": "Grenade",
      "artist": "Bruno Mars",
      "year": 2010,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 110,
      "originalKey": "Dm",
      "chords": ["Dm", "Bb", "F", "C"],
      "insight": "Chorus breaks out of Dm's tension into F–C brightness mid-phrase."
    },
    {
      "id": "passenger-let-her-go",
      "title": "Let Her Go",
      "artist": "Passenger",
      "year": 2012,
      "genre": "Folk / Country",
      "section": "Chorus",
      "bpm": 75,
      "originalKey": "G",
      "chords": ["F", "C", "G", "Am"],
      "insight": "Starting the chorus on IV (F) creates an airy floating lift before landing on Am."
    },
    {
      "id": "stand-by-me",
      "title": "Stand by Me",
      "artist": "Ben E. King",
      "year": 1961,
      "genre": "R&B / Soul",
      "section": "Main Loop",
      "bpm": 118,
      "originalKey": "A",
      "chords": ["A", "F#m", "D", "E"],
      "insight": "Archetypal 50s doo-wop I–vi–IV–V propelled by an unforgettable syncopated bassline."
    },
    {
      "id": "every-breath-you-take",
      "title": "Every Breath You Take",
      "artist": "The Police",
      "year": 1983,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 117,
      "originalKey": "Ab",
      "chords": ["Ab", "Fm", "Db", "Eb"],
      "insight": "Add9 guitar arpeggios give glassy tension to the timeless I–vi–IV–V loop."
    },
    {
      "id": "baby-justin-bieber",
      "title": "Baby",
      "artist": "Justin Bieber",
      "year": 2010,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 130,
      "originalKey": "Eb",
      "chords": ["Eb", "Cm", "Ab", "Bb"],
      "insight": "Modern pop production modernizes 1950s I–vi–IV–V with rhythmic vocal chants."
    },
    {
      "id": "perfect-ed-sheeran",
      "title": "Perfect",
      "artist": "Ed Sheeran",
      "year": 2017,
      "genre": "Pop",
      "section": "Verse",
      "bpm": 63,
      "originalKey": "Ab",
      "chords": ["Ab", "Fm", "Db", "Eb"],
      "insight": "6/8 waltz feel turns I–vi–IV–V into a sweeping romantic slow dance."
    },
    {
      "id": "unforgettable",
      "title": "Earth Angel",
      "artist": "The Penguins",
      "year": 1954,
      "genre": "R&B / Soul",
      "section": "Main Loop",
      "bpm": 76,
      "originalKey": "Ab",
      "chords": ["Ab", "Fm", "Db", "Eb"],
      "insight": "Foundational 1950s I–vi–IV–V progression with lush vocal group harmonies."
    },
    {
      "id": "i-will-always-love-you",
      "title": "I Will Always Love You",
      "artist": "Whitney Houston",
      "year": 1992,
      "genre": "R&B / Soul",
      "section": "Chorus",
      "bpm": 67,
      "originalKey": "A",
      "chords": ["A", "F#m", "D", "E"],
      "insight": "Soaring vocal belt peaks over D (IV) before resolving back through E7."
    },
    {
      "id": "happiness-is-a-warm-gun-turnaround",
      "title": "Blue Moon",
      "artist": "Richard Rodgers & Lorenz Hart",
      "year": 1934,
      "genre": "Jazz / Standards",
      "section": "Main Loop",
      "bpm": 92,
      "originalKey": "Eb",
      "chords": ["Eb", "Cm", "Fm", "Bb7"],
      "insight": "Timeless I–vi–ii–V jazz-pop turnaround with smooth downward root motion."
    },
    {
      "id": "heart-and-soul",
      "title": "Heart and Soul",
      "artist": "Hoagy Carmichael",
      "year": 1938,
      "genre": "Jazz / Standards",
      "section": "Main Loop",
      "bpm": 112,
      "originalKey": "C",
      "chords": ["C", "Am", "F", "G"],
      "insight": "The quintessential I–vi–IV–V playground duet progression."
    },
    {
      "id": "last-kiss",
      "title": "Last Kiss",
      "artist": "Pearl Jam",
      "year": 1999,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 108,
      "originalKey": "G",
      "chords": ["G", "Em", "C", "D"],
      "insight": "Raw acoustic strumming keeps the classic 4-chord story rolling nonstop."
    },
    {
      "id": "d-yer-mak-er",
      "title": "D'yer Mak'er",
      "artist": "Led Zeppelin",
      "year": 1973,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 81,
      "originalKey": "C",
      "chords": ["C", "Am", "F", "G"],
      "insight": "Syncopated reggae-rock drums disguise a pure 50s I–vi–IV–V chord cycle."
    },
    {
      "id": "all-i-have-to-do-is-dream",
      "title": "All I Have to Do Is Dream",
      "artist": "The Everly Brothers",
      "year": 1958,
      "genre": "Folk / Country",
      "section": "Verse",
      "bpm": 96,
      "originalKey": "E",
      "chords": ["E", "C#m", "A", "B"],
      "insight": "Tight close-harmony vocals float effortlessly over I–vi–IV–V."
    },
    {
      "id": "twist-and-shout",
      "title": "Twist and Shout",
      "artist": "The Beatles",
      "year": 1963,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 125,
      "originalKey": "D",
      "chords": ["D", "G", "A"],
      "insight": "Three-chord I–IV–V rocket fuel capped with a climbing vocal harmony stack."
    },
    {
      "id": "la-bamba",
      "title": "La Bamba",
      "artist": "Ritchie Valens",
      "year": 1958,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 144,
      "originalKey": "C",
      "chords": ["C", "F", "G"],
      "insight": "Iconic guitar riff outlines C–F–G–F in joyful major energy."
    },
    {
      "id": "wild-thing",
      "title": "Wild Thing",
      "artist": "The Troggs",
      "year": 1966,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 103,
      "originalKey": "A",
      "chords": ["A", "D", "E", "D"],
      "insight": "I–IV–V–IV palindrome creates an instantly recognizable garage-rock hook."
    },
    {
      "id": "louie-louie",
      "title": "Louie Louie",
      "artist": "The Kingsmen",
      "year": 1963,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 122,
      "originalKey": "A",
      "chords": ["A", "D", "Em", "D"],
      "insight": "Using a minor v chord (Em) inside a rock riff adds gritty garage edge."
    },
    {
      "id": "mr-brightside-chorus",
      "title": "Mr. Brightside",
      "artist": "The Killers",
      "year": 2003,
      "genre": "Indie / Alt",
      "section": "Chorus",
      "bpm": 148,
      "originalKey": "Db",
      "chords": ["Db", "Gb", "Bbm", "Ab"],
      "insight": "I–IV–vi–V chorus explodes outward after a tense tonic-pedal verse."
    },
    {
      "id": "summer-of-69",
      "title": "Summer of '69",
      "artist": "Bryan Adams",
      "year": 1984,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 139,
      "originalKey": "D",
      "chords": ["D", "A", "D", "A"],
      "insight": "Propulsive suspended I–V riff locks into the verse before opening to Bm–G in the chorus."
    },
    {
      "id": "free-fallin",
      "title": "Free Fallin'",
      "artist": "Tom Petty",
      "year": 1989,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 84,
      "originalKey": "F",
      "chords": ["F", "Bb", "Bb", "F", "C"],
      "insight": "Suspended acoustic voicings make a simple I–IV–I–V loop shimmer endlessly."
    },
    {
      "id": "sweet-home-alabama",
      "title": "Sweet Home Alabama",
      "artist": "Lynyrd Skynyrd",
      "year": 1974,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 98,
      "originalKey": "G",
      "chords": ["D", "C", "G"],
      "insight": "Mixolydian V–IV–I (or I–♭VII–IV in D) creates laid-back Southern rock bounce."
    },
    {
      "id": "all-summer-long",
      "title": "Werewolves of London",
      "artist": "Warren Zevon",
      "year": 1978,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 103,
      "originalKey": "G",
      "chords": ["D", "C", "G"],
      "insight": "Punchy piano riff hammers D–C–G with unmistakable groove."
    },
    {
      "id": "sweet-child-o-mine",
      "title": "Sweet Child o' Mine",
      "artist": "Guns N' Roses",
      "year": 1987,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 125,
      "originalKey": "Db",
      "chords": ["Db", "B", "Gb", "Db"],
      "insight": "Borrowed ♭VII (B) gives Mixolydian swagger to the iconic arpeggiated intro."
    },
    {
      "id": "you-really-got-me",
      "title": "Sympathy for the Devil",
      "artist": "The Rolling Stones",
      "year": 1968,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 116,
      "originalKey": "E",
      "chords": ["E", "D", "A", "E"],
      "insight": "I–♭VII–IV–I drives hypnotic samba-rock momentum."
    },
    {
      "id": "hey-jude-outro",
      "title": "Hey Jude (Outro)",
      "artist": "The Beatles",
      "year": 1968,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 74,
      "originalKey": "F",
      "chords": ["F", "Eb", "Bb", "F"],
      "insight": "The Mixolydian ♭VII (Eb) makes the endless refrain feel communal and unstoppable."
    },
    {
      "id": "royals",
      "title": "Royals",
      "artist": "Lorde",
      "year": 2013,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 85,
      "originalKey": "D",
      "chords": ["D", "C", "G"],
      "insight": "Minimalist snap percussion lets a crisp D–C–G Mixolydian hook dominate."
    },
    {
      "id": "get-lucky",
      "title": "Get Lucky",
      "artist": "Daft Punk",
      "year": 2013,
      "genre": "Electronic / Dance",
      "section": "Main Loop",
      "bpm": 116,
      "originalKey": "Bm",
      "chords": ["Bm", "D", "F#m", "E"],
      "insight": "Dorian i–III–v–IV keeps Nile Rodgers' funk guitar bright yet cool."
    },
    {
      "id": "mad-world",
      "title": "Mad World",
      "artist": "Tears for Fears / Gary Jules",
      "year": 1982,
      "genre": "Indie / Alt",
      "section": "Verse",
      "bpm": 88,
      "originalKey": "Fm",
      "chords": ["Fm", "Ab", "Eb", "Bb"],
      "insight": "Dorian major IV (Bb) adds bittersweet light inside a stark minor loop."
    },
    {
      "id": "boulevard-of-broken-dreams",
      "title": "Boulevard of Broken Dreams",
      "artist": "Green Day",
      "year": 2004,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 83,
      "originalKey": "Fm",
      "chords": ["Fm", "Ab", "Eb", "Bb"],
      "insight": "Tremolo guitar frames Dorian i–III–VII–IV before the chorus flips to major."
    },
    {
      "id": "wonderwall-verse",
      "title": "Wonderwall",
      "artist": "Oasis",
      "year": 1995,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 87,
      "originalKey": "F#m",
      "chords": ["F#m", "A", "E", "B"],
      "insight": "Top-string D & A drone pedal ties i–III–VII–IV into one cohesive guitar wash."
    },
    {
      "id": "pumped-up-kicks",
      "title": "Pumped Up Kicks",
      "artist": "Foster the People",
      "year": 2010,
      "genre": "Indie / Alt",
      "section": "Main Loop",
      "bpm": 128,
      "originalKey": "Fm",
      "chords": ["Fm", "Ab", "Eb", "Bb"],
      "insight": "Upbeat whistle melody masks darker lyrics over a sunny Dorian groove."
    },
    {
      "id": "radioactive",
      "title": "Radioactive",
      "artist": "Imagine Dragons",
      "year": 2012,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 136,
      "originalKey": "Bm",
      "chords": ["Bm", "D", "A", "E"],
      "insight": "Stomping halftime drums slam onto i–III–VII–IV with cinematic bass drops."
    },
    {
      "id": "creep",
      "title": "Creep",
      "artist": "Radiohead",
      "year": 1992,
      "genre": "Indie / Alt",
      "section": "Main Loop",
      "bpm": 92,
      "originalKey": "G",
      "chords": ["G", "B", "C", "Cm"],
      "insight": "I–III–IV–iv uses secondary V/vi (B) and borrowed minor iv (Cm) for heartbreak."
    },
    {
      "id": "the-air-that-i-breathe",
      "title": "The Air That I Breathe",
      "artist": "The Hollies",
      "year": 1974,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 82,
      "originalKey": "C",
      "chords": ["C", "E", "F", "Fm"],
      "insight": "Lush orchestral I–III–IV–iv chord color swells dramatically into the chorus."
    },
    {
      "id": "space-oddity-verse",
      "title": "Space Oddity",
      "artist": "David Bowie",
      "year": 1969,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 70,
      "originalKey": "C",
      "chords": ["C", "E", "F", "Fm"],
      "insight": "Chromatic voice line (G -> G# -> A -> Ab) turns simple chords into outer-space drama."
    },
    {
      "id": "in-my-life",
      "title": "In My Life (Bridge/Verse)",
      "artist": "The Beatles",
      "year": 1965,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 103,
      "originalKey": "A",
      "chords": ["A", "E", "F#m", "A7", "D", "Dm", "A"],
      "insight": "Brief borrowed minor iv (Dm) gives bittersweet nostalgia before resolving home."
    },
    {
      "id": "wake-me-up-when-september-ends",
      "title": "Wake Me Up When September Ends",
      "artist": "Green Day",
      "year": 2004,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 105,
      "originalKey": "G",
      "chords": ["G", "D", "Em", "Bm", "C", "Cm", "G"],
      "insight": "Descending bass meets a poignant C -> Cm (IV -> iv) sigh at the cadence."
    },
    {
      "id": "my-girl",
      "title": "My Girl",
      "artist": "The Temptations",
      "year": 1964,
      "genre": "R&B / Soul",
      "section": "Verse",
      "bpm": 104,
      "originalKey": "C",
      "chords": ["C", "F", "C", "F"],
      "insight": "Pentatonic guitar hook dances joyously between I and IV."
    },
    {
      "id": "sitting-on-the-dock",
      "title": "(Sittin' On) The Dock of the Bay",
      "artist": "Otis Redding",
      "year": 1968,
      "genre": "R&B / Soul",
      "section": "Verse",
      "bpm": 104,
      "originalKey": "G",
      "chords": ["G", "B", "C", "A"],
      "insight": "Playful chromatic major chords (I–III–IV–II) mimic sunlit rolling waves."
    },
    {
      "id": "dreams-fleetwood",
      "title": "Dreams",
      "artist": "Fleetwood Mac",
      "year": 1977,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 120,
      "originalKey": "C",
      "chords": ["Fmaj7", "G"],
      "insight": "Two-chord IV–V pendulum creates infinite yearning without ever fully landing on I."
    },
    {
      "id": "jane-says",
      "title": "Jane Says",
      "artist": "Jane's Addiction",
      "year": 1988,
      "genre": "Indie / Alt",
      "section": "Main Loop",
      "bpm": 108,
      "originalKey": "G",
      "chords": ["G", "A"],
      "insight": "Bright Lydian I–II chord oscillation floats over hypnotic steel drums."
    },
    {
      "id": "hit-the-road-jack",
      "title": "Hit the Road Jack",
      "artist": "Ray Charles",
      "year": 1961,
      "genre": "R&B / Soul",
      "section": "Main Loop",
      "bpm": 87,
      "originalKey": "Am",
      "chords": ["Am", "G", "F", "E7"],
      "insight": "The Andalusian cadence (i–♭VII–♭VI–V7) pulls forcefully back to Am."
    },
    {
      "id": "sultans-of-swing",
      "title": "Sultans of Swing",
      "artist": "Dire Straits",
      "year": 1978,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 148,
      "originalKey": "Dm",
      "chords": ["Dm", "C", "Bb", "A7"],
      "insight": "Crisp fingerpicked triads drive a brisk minor Andalusian turnaround."
    },
    {
      "id": "happy-together",
      "title": "Happy Together",
      "artist": "The Turtles",
      "year": 1967,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 120,
      "originalKey": "F#m",
      "chords": ["F#m", "E", "D", "C#7"],
      "insight": "Andalusian minor verse sets up a dramatic parallel-major chorus explosion."
    },
    {
      "id": "smooth",
      "title": "Smooth",
      "artist": "Santana feat. Rob Thomas",
      "year": 1999,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 116,
      "originalKey": "Am",
      "chords": ["Am", "G", "F", "E7"],
      "insight": "Latin rock percussion fires up the classic descending i–♭VII–♭VI–V7 groove."
    },
    {
      "id": "good-vibrations-verse",
      "title": "Good Vibrations",
      "artist": "The Beach Boys",
      "year": 1966,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 133,
      "originalKey": "Em",
      "chords": ["Em", "D", "C", "B7"],
      "insight": "Stepwise downward minor descent slides straight into the psychedelic Theremin chorus."
    },
    {
      "id": "all-along-the-watchtower",
      "title": "All Along the Watchtower",
      "artist": "Jimi Hendrix",
      "year": 1968,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 113,
      "originalKey": "C#m",
      "chords": ["C#m", "B", "A", "B"],
      "insight": "Pendulum i–♭VII–♭VI–♭VII creates a brooding, cyclical rock canvas for solos."
    },
    {
      "id": "rolling-in-the-deep-chorus",
      "title": "Rolling in the Deep",
      "artist": "Adele",
      "year": 2010,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 105,
      "originalKey": "Cm",
      "chords": ["Cm", "Bb", "Ab", "Bb"],
      "insight": "Powerhouse gospel chorus rides i–♭VII–♭VI–♭VII with thunderous stomps."
    },
    {
      "id": "stairway-to-heaven-outro",
      "title": "Stairway to Heaven (Solo/Outro)",
      "artist": "Led Zeppelin",
      "year": 1971,
      "genre": "Rock",
      "section": "Bridge",
      "bpm": 82,
      "originalKey": "Am",
      "chords": ["Am", "G", "F", "G"],
      "insight": "i–♭VII–♭VI–♭VII provides majestic modal rock lift for Page's solo."
    },
    {
      "id": "my-heart-will-go-on-chorus",
      "title": "My Heart Will Go On",
      "artist": "Celine Dion",
      "year": 1997,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 99,
      "originalKey": "E",
      "chords": ["C#m", "B", "A", "B"],
      "insight": "Chorus pivots off vi–V–IV–V to launch the sweeping orchestral climax."
    },
    {
      "id": "blinding-lights",
      "title": "Blinding Lights",
      "artist": "The Weeknd",
      "year": 2019,
      "genre": "Electronic / Dance",
      "section": "Main Loop",
      "bpm": 171,
      "originalKey": "Fm",
      "chords": ["Fm", "Cm", "Eb", "Bb"],
      "insight": "80s synthwave lead races over a minor Dorian-flavored i–v–♭VII–IV bed."
    },
    {
      "id": "levels",
      "title": "Levels",
      "artist": "Avicii",
      "year": 2011,
      "genre": "Electronic / Dance",
      "section": "Main Loop",
      "bpm": 126,
      "originalKey": "C#m",
      "chords": ["C#m", "E", "B", "A"],
      "insight": "Euphoric EDM piano melody weaves across i–♭III–♭VII–♭VI."
    },
    {
      "id": "titanium",
      "title": "Titanium",
      "artist": "David Guetta feat. Sia",
      "year": 2011,
      "genre": "Electronic / Dance",
      "section": "Verse",
      "bpm": 126,
      "originalKey": "Eb",
      "chords": ["Eb", "Bb", "Cm", "Ab"],
      "insight": "Acoustic verse chords explode into sidechained synth stabs on the drop."
    },
    {
      "id": "dont-you-worry-child",
      "title": "Don't You Worry Child",
      "artist": "Swedish House Mafia",
      "year": 2012,
      "genre": "Electronic / Dance",
      "section": "Chorus",
      "bpm": 129,
      "originalKey": "D",
      "chords": ["Bm", "G", "D", "A"],
      "insight": "Festival supersaws turn vi–IV–I–V into massive communal euphoria."
    },
    {
      "id": "fly-me-to-the-moon",
      "title": "Fly Me to the Moon",
      "artist": "Frank Sinatra / Bart Howard",
      "year": 1954,
      "genre": "Jazz / Standards",
      "section": "Verse",
      "bpm": 120,
      "originalKey": "C",
      "chords": ["Am7", "Dm7", "G7", "Cmaj7", "Fmaj7", "Bm7b5", "E7", "Am7"],
      "insight": "Pure descending Circle of Fifths chain (vi–ii–V–I–IV–viiø–V/vi–vi)!"
    },
    {
      "id": "autumn-leaves",
      "title": "Autumn Leaves",
      "artist": "Joseph Kosma / Jazz Standard",
      "year": 1945,
      "genre": "Jazz / Standards",
      "section": "Main Loop",
      "bpm": 116,
      "originalKey": "Gm",
      "chords": ["Cm7", "F7", "Bbmaj7", "Ebmaj7", "Am7b5", "D7", "Gm"],
      "insight": "Alternates major ii–V–I–IV with minor iiø–V7–i straight down the Circle of Fifths."
    },
    {
      "id": "i-will-survive",
      "title": "I Will Survive",
      "artist": "Gloria Gaynor",
      "year": 1978,
      "genre": "Electronic / Dance",
      "section": "Main Loop",
      "bpm": 117,
      "originalKey": "Am",
      "chords": ["Am", "Dm", "G", "Cmaj7", "Fmaj7", "Bm7b5", "E7"],
      "insight": "Disco anthem rides an unbroken 7-step Circle of Fifths descent back to Am."
    },
    {
      "id": "hello-lionel-richie",
      "title": "Hello",
      "artist": "Lionel Richie",
      "year": 1983,
      "genre": "R&B / Soul",
      "section": "Chorus",
      "bpm": 62,
      "originalKey": "Am",
      "chords": ["Am", "G", "F", "G", "Am"],
      "insight": "Lush string swells lift the tender minor ballad over stepwise chord motion."
    },
    {
      "id": "killing-me-softly",
      "title": "Killing Me Softly with His Song",
      "artist": "Roberta Flack / Fugees",
      "year": 1973,
      "genre": "R&B / Soul",
      "section": "Chorus",
      "bpm": 92,
      "originalKey": "Fm",
      "chords": ["Fm7", "Bbm7", "Eb7", "Abmaj7"],
      "insight": "Chorus pivots smoothly through a minor-to-major ii–V–I soul cadence."
    },
    {
      "id": "sunday-morning",
      "title": "Sunday Morning",
      "artist": "Maroon 5",
      "year": 2002,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 88,
      "originalKey": "C",
      "chords": ["Dm7", "G7", "Cmaj7"],
      "insight": "Effortless neo-soul ii–V–I groove loops endlessly with Rhodes warmth."
    },
    {
      "id": "september-earth-wind-fire",
      "title": "September",
      "artist": "Earth, Wind & Fire",
      "year": 1978,
      "genre": "R&B / Soul",
      "section": "Verse",
      "bpm": 126,
      "originalKey": "A",
      "chords": ["Dmaj7", "C#m7", "Bm7", "E7"],
      "insight": "Sliding parallel 7th chords cascade down into a buoyant horn-driven groove."
    },
    {
      "id": "just-the-two-of-us",
      "title": "Just the Two of Us",
      "artist": "Grover Washington Jr. & Bill Withers",
      "year": 1981,
      "genre": "R&B / Soul",
      "section": "Main Loop",
      "bpm": 96,
      "originalKey": "Fm",
      "chords": ["Dbmaj7", "C7", "Fm7", "Ebm7", "Ab7"],
      "insight": "Chromatic ♭VI–V7–i followed by a secondary ii–V makes pure neo-soul velvet."
    },
    {
      "id": "isnt-she-lovely",
      "title": "Isn't She Lovely",
      "artist": "Stevie Wonder",
      "year": 1976,
      "genre": "R&B / Soul",
      "section": "Main Loop",
      "bpm": 119,
      "originalKey": "E",
      "chords": ["C#m7", "F#7", "B7", "E"],
      "insight": "Circle-of-fifths chain (vi7–II7–V7–I) bounces effortlessly with Stevie's harmonica."
    },
    {
      "id": "superstition-bridge",
      "title": "Sir Duke",
      "artist": "Stevie Wonder",
      "year": 1976,
      "genre": "R&B / Soul",
      "section": "Verse",
      "bpm": 107,
      "originalKey": "B",
      "chords": ["B", "G#m7", "G7", "F#7"],
      "insight": "Chromatic bVI7 tritone pass adds infectious jazz-funk snap."
    },
    {
      "id": "hotel-california",
      "title": "Hotel California",
      "artist": "Eagles",
      "year": 1976,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 75,
      "originalKey": "Bm",
      "chords": ["Bm", "F#", "A", "E", "G", "D", "Em", "F#"],
      "insight": "8-bar descending chromatic inner voice moves seamlessly down from B to F#."
    },
    {
      "id": "hallelujah",
      "title": "Hallelujah",
      "artist": "Leonard Cohen / Jeff Buckley",
      "year": 1984,
      "genre": "Folk / Country",
      "section": "Verse",
      "bpm": 56,
      "originalKey": "C",
      "chords": ["C", "Am", "C", "Am", "F", "G", "C", "G"],
      "insight": "Lyrics literally narrate the chord progression ('the fourth, the fifth, the minor fall')."
    },
    {
      "id": "canon-in-d",
      "title": "Basket Case",
      "artist": "Green Day",
      "year": 1994,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 170,
      "originalKey": "Eb",
      "chords": ["Eb", "Bb", "Cm", "Gm", "Ab", "Eb", "Ab", "Bb"],
      "insight": "Pachelbel's Canon I–V–vi–iii–IV–I–IV–V transformed into punk angst."
    },
    {
      "id": "memories-maroon-5",
      "title": "Memories",
      "artist": "Maroon 5",
      "year": 2019,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 91,
      "originalKey": "B",
      "chords": ["B", "F#", "G#m", "D#m", "E", "B", "E", "F#"],
      "insight": "Direct modern pop adaptation of the 8-bar Canon chord sequence."
    },
    {
      "id": "crying-roy-orbison",
      "title": "Cryin'",
      "artist": "Aerosmith",
      "year": 1993,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 100,
      "originalKey": "A",
      "chords": ["A", "E", "F#m", "C#m", "D", "A", "E"],
      "insight": "Canon descent adds soaring arena guitar hooks on the iii chord transition."
    },
    {
      "id": "hey-there-delilah",
      "title": "Hey There Delilah",
      "artist": "Plain White T's",
      "year": 2006,
      "genre": "Indie / Alt",
      "section": "Verse",
      "bpm": 104,
      "originalKey": "D",
      "chords": ["D", "F#m", "D", "F#m"],
      "insight": "Intimate I–iii oscillation leaves maximum breathing room for conversational storytelling."
    },
    {
      "id": "fast-car",
      "title": "Fast Car",
      "artist": "Tracy Chapman",
      "year": 1988,
      "genre": "Folk / Country",
      "section": "Verse",
      "bpm": 104,
      "originalKey": "A",
      "chords": ["F#m", "A", "E", "D"],
      "insight": "Iconic acoustic picking pattern glides between F#m/D and A/E with suspended chimes."
    },
    {
      "id": "viva-la-vida",
      "title": "Viva La Vida",
      "artist": "Coldplay",
      "year": 2008,
      "genre": "Indie / Alt",
      "section": "Main Loop",
      "bpm": 138,
      "originalKey": "Ab",
      "chords": ["Db", "Eb", "Ab", "Fm"],
      "insight": "IV–V–I–vi royal cadence creates forward momentum that never feels stale."
    },
    {
      "id": "teenagers",
      "title": "Use Somebody",
      "artist": "Kings of Leon",
      "year": 2008,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 137,
      "originalKey": "C",
      "chords": ["C", "Em", "F", "Am"],
      "insight": "Re-ordering I–iii–IV–vi builds gradual emotional tension across each bar."
    },
    {
      "id": "firework",
      "title": "Firework",
      "artist": "Katy Perry",
      "year": 2010,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 124,
      "originalKey": "Ab",
      "chords": ["Ab", "Bbm", "Fm", "Db"],
      "insight": "I–ii–vi–IV avoids the dominant V completely, giving buoyant modern pop lift."
    },
    {
      "id": "levitating",
      "title": "Levitating",
      "artist": "Dua Lipa",
      "year": 2020,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 103,
      "originalKey": "Bm",
      "chords": ["Bm", "F#m", "Em", "Bm"],
      "insight": "Disco-funk bassline locks tightly to i–v–iv–i minor groove."
    },
    {
      "id": "as-it-was",
      "title": "As It Was",
      "artist": "Harry Styles",
      "year": 2022,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 174,
      "originalKey": "A",
      "chords": ["D", "Bm", "E", "A"],
      "insight": "Starting on IV (D) -> ii (Bm) -> V (E) -> I (A) gives breezy 80s synth-pop resolution."
    },
    {
      "id": "anti-hero",
      "title": "Anti-Hero",
      "artist": "Taylor Swift",
      "year": 2022,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 97,
      "originalKey": "E",
      "chords": ["A", "E", "B", "C#m"],
      "insight": "IV–I–V–vi rotation puts emphasis on the earnest IV chord at phrase starts."
    },
    {
      "id": "cruel-summer",
      "title": "Cruel Summer",
      "artist": "Taylor Swift",
      "year": 2019,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 170,
      "originalKey": "A",
      "chords": ["D", "E", "C#m", "F#m"],
      "insight": "The golden anime/J-pop/synth-pop IV–V–iii–vi cadence surges straight upward."
    },
    {
      "id": "blank-space",
      "title": "Blank Space",
      "artist": "Taylor Swift",
      "year": 2014,
      "genre": "Pop",
      "section": "Verse",
      "bpm": 96,
      "originalKey": "F",
      "chords": ["F", "Dm", "Bb", "C"],
      "insight": "Classic I–vi–IV–V updated with crisp staccato plucks and conversational phrasing."
    },
    {
      "id": "love-story",
      "title": "Love Story",
      "artist": "Taylor Swift",
      "year": 2008,
      "genre": "Folk / Country",
      "section": "Chorus",
      "bpm": 119,
      "originalKey": "D",
      "chords": ["D", "A", "Bm", "G"],
      "insight": "A whole-step key modulation up to E on the final chorus supercharges I–V–vi–IV."
    },
    {
      "id": "bad-romance",
      "title": "Bad Romance",
      "artist": "Lady Gaga",
      "year": 2009,
      "genre": "Electronic / Dance",
      "section": "Chorus",
      "bpm": 119,
      "originalKey": "Am",
      "chords": ["F", "G", "Am", "C"],
      "insight": "Chorus leans into F–G–Am drive with theatrical chromatic hook intervals."
    },
    {
      "id": "shape-of-you",
      "title": "Shape of You",
      "artist": "Ed Sheeran",
      "year": 2017,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 96,
      "originalKey": "C#m",
      "chords": ["C#m", "F#m", "A", "B"],
      "insight": "Marimba riff rides i–iv–VI–VII while rhythm carries the entire arrangement."
    },
    {
      "id": "stay-with-me",
      "title": "Stay with Me",
      "artist": "Sam Smith",
      "year": 2014,
      "genre": "R&B / Soul",
      "section": "Chorus",
      "bpm": 84,
      "originalKey": "C",
      "chords": ["Am", "F", "C"],
      "insight": "Three-chord gospel vi–IV–I loop repeats with massive choir harmonies."
    },
    {
      "id": "all-of-me",
      "title": "All of Me",
      "artist": "John Legend",
      "year": 2013,
      "genre": "R&B / Soul",
      "section": "Chorus",
      "bpm": 120,
      "originalKey": "Ab",
      "chords": ["Ab", "Fm", "Db", "Eb"],
      "insight": "Verses start on vi–IV–I–V, then chorus flips to I–vi–IV–V for emotional release."
    },
    {
      "id": "shallow-chorus",
      "title": "Shallow",
      "artist": "Lady Gaga & Bradley Cooper",
      "year": 2018,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 96,
      "originalKey": "G",
      "chords": ["Am", "D", "G", "Em"],
      "insight": "ii–V–I–vi chorus launches straight into Gaga's soaring high belt."
    },
    {
      "id": "someone-you-loved",
      "title": "Someone You Loved",
      "artist": "Lewis Capaldi",
      "year": 2018,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 110,
      "originalKey": "Db",
      "chords": ["Db", "Ab", "Bbm", "Gb"],
      "insight": "Sparse, raw piano chords let the strained vocal delivery command the spotlight."
    },
    {
      "id": "flowers-miley",
      "title": "Flowers",
      "artist": "Miley Cyrus",
      "year": 2023,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 118,
      "originalKey": "Am",
      "chords": ["Am", "Dm", "G", "C"],
      "insight": "Subtle nod to 'I Will Survive' using the i–iv–VII–III Circle of Fifths walk."
    },
    {
      "id": "vampire-olivia",
      "title": "vampire",
      "artist": "Olivia Rodrigo",
      "year": 2023,
      "genre": "Pop",
      "section": "Verse",
      "bpm": 138,
      "originalKey": "F",
      "chords": ["F", "A", "Bb", "Bbm"],
      "insight": "The classic Creep I–III–IV–iv progression reborn as modern pop-rock storytelling."
    },
    {
      "id": "drivers-license",
      "title": "drivers license",
      "artist": "Olivia Rodrigo",
      "year": 2021,
      "genre": "Pop",
      "section": "Verse",
      "bpm": 144,
      "originalKey": "Bb",
      "chords": ["Bb", "Gm", "Eb", "Bb"],
      "insight": "Car-turn-signal pulse steadies an intimate I–vi–IV–I confession."
    },
    {
      "id": "espresso",
      "title": "Espresso",
      "artist": "Sabrina Carpenter",
      "year": 2024,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 104,
      "originalKey": "C",
      "chords": ["Dm7", "G", "Em7", "Am"],
      "insight": "Breezy ii–V–iii–vi disco-pop loop stays permanently buoyant and danceable."
    },
    {
      "id": "golden-hour",
      "title": "golden hour",
      "artist": "JVKE",
      "year": 2022,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 94,
      "originalKey": "E",
      "chords": ["A", "B", "G#m", "C#m"],
      "insight": "Waltzing 6/8 piano arpeggios sweep through the emotional IV–V–iii–vi cascade."
    },
    {
      "id": "pink-pony-club",
      "title": "Pink Pony Club",
      "artist": "Chappell Roan",
      "year": 2020,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 107,
      "originalKey": "F#",
      "chords": ["B", "C#m", "F#", "D#m"],
      "insight": "Lifting through IV–v/V–I–vi gives theatrical, joyous anthem energy."
    },
    {
      "id": "stairway-intro",
      "title": "Stairway to Heaven (Intro)",
      "artist": "Led Zeppelin",
      "year": 1971,
      "genre": "Rock",
      "section": "Intro / Riff",
      "bpm": 72,
      "originalKey": "Am",
      "chords": ["Am", "E", "C", "D", "F", "G", "Am"],
      "insight": "Chromatic descending bass (A–G#–G–F#–F) weaves under delicate acoustic fingerpicking."
    },
    {
      "id": "house-of-the-rising-sun",
      "title": "The House of the Rising Sun",
      "artist": "The Animals",
      "year": 1964,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 78,
      "originalKey": "Am",
      "chords": ["Am", "C", "D", "F", "Am", "C", "E", "E"],
      "insight": "Iconic 6/8 arpeggio turns i–III–IV–VI into haunting folk-rock drama."
    },
    {
      "id": "california-dreamin",
      "title": "California Dreamin'",
      "artist": "The Mamas & The Papas",
      "year": 1965,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 112,
      "originalKey": "C#m",
      "chords": ["C#m", "B", "A", "B", "G#7"],
      "insight": "Suspended E4–E3 resolutions decorate a longing minor descent."
    },
    {
      "id": "smells-like-teen-spirit",
      "title": "Smells Like Teen Spirit",
      "artist": "Nirvana",
      "year": 1991,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 117,
      "originalKey": "Fm",
      "chords": ["Fm", "Bb", "Ab", "Db"],
      "insight": "Chunky power-chord riff leaps around Fm's Phrygian/Aeolian neighbors."
    },
    {
      "id": "where-is-my-mind",
      "title": "Where Is My Mind?",
      "artist": "Pixies",
      "year": 1988,
      "genre": "Indie / Alt",
      "section": "Main Loop",
      "bpm": 81,
      "originalKey": "E",
      "chords": ["E", "C#m", "G#", "A"],
      "insight": "Major III (G#) injects surreal, unsettling beauty into I–vi–III–IV."
    },
    {
      "id": "karma-police",
      "title": "Karma Police",
      "artist": "Radiohead",
      "year": 1997,
      "genre": "Indie / Alt",
      "section": "Chorus",
      "bpm": 75,
      "originalKey": "G",
      "chords": ["C", "D", "G", "F#", "C", "D", "G", "Bm"],
      "insight": "Unexpected chromatic F# shock chord makes the chorus hook unforgettable."
    },
    {
      "id": "yellow-coldplay",
      "title": "Yellow",
      "artist": "Coldplay",
      "year": 2000,
      "genre": "Indie / Alt",
      "section": "Chorus",
      "bpm": 87,
      "originalKey": "B",
      "chords": ["E", "G#m", "F#"],
      "insight": "Chorus suspends on IV–vi–V while an open B string rings over every chord."
    },
    {
      "id": "fix-you",
      "title": "Fix You",
      "artist": "Coldplay",
      "year": 2005,
      "genre": "Indie / Alt",
      "section": "Verse",
      "bpm": 69,
      "originalKey": "Eb",
      "chords": ["Eb", "Gm", "Cm", "Bb"],
      "insight": "Warm organ voicing of I–iii–vi–V creates hymn-like intimacy before drums enter."
    },
    {
      "id": "clocks",
      "title": "Clocks",
      "artist": "Coldplay",
      "year": 2002,
      "genre": "Indie / Alt",
      "section": "Main Loop",
      "bpm": 131,
      "originalKey": "Eb",
      "chords": ["Eb", "Bbm", "Bbm", "Fm"],
      "insight": "Minor v (Bbm) gives the iconic 3-3-2 piano arpeggio an urgent Mixolydian pulse."
    },
    {
      "id": "chasing-cars",
      "title": "Chasing Cars",
      "artist": "Snow Patrol",
      "year": 2006,
      "genre": "Indie / Alt",
      "section": "Main Loop",
      "bpm": 104,
      "originalKey": "A",
      "chords": ["A", "E", "D", "A"],
      "insight": "Two-note guitar ostinato carries I–V–IV–I from whisper to full distortion."
    },
    {
      "id": "skinny-love",
      "title": "Skinny Love",
      "artist": "Bon Iver",
      "year": 2007,
      "genre": "Folk / Country",
      "section": "Chorus",
      "bpm": 76,
      "originalKey": "C",
      "chords": ["Am", "C", "G", "Am"],
      "insight": "Open-tuned resonator guitar drones around Am–C–G with raw falsetto phrasing."
    },
    {
      "id": "riptide",
      "title": "Riptide",
      "artist": "Vance Joy",
      "year": 2013,
      "genre": "Indie / Alt",
      "section": "Main Loop",
      "bpm": 102,
      "originalKey": "C",
      "chords": ["Am", "G", "C"],
      "insight": "Ukulele strum rides an infectious 3-chord Am–G–C (1–1–2 bar) loop."
    },
    {
      "id": "ho-hey",
      "title": "Ho Hey",
      "artist": "The Lumineers",
      "year": 2012,
      "genre": "Folk / Country",
      "section": "Verse",
      "bpm": 80,
      "originalKey": "C",
      "chords": ["C", "F", "C", "G"],
      "insight": "Stomp-clap folk bounce keeps I–IV–I–V anthemic and singable."
    },
    {
      "id": "jolene",
      "title": "Jolene",
      "artist": "Dolly Parton",
      "year": 1973,
      "genre": "Folk / Country",
      "section": "Chorus",
      "bpm": 111,
      "originalKey": "C#m",
      "chords": ["C#m", "E", "B", "C#m"],
      "insight": "Rapid fingerpicking drives pleading minor-to-relative-major tension."
    },
    {
      "id": "ring-of-fire",
      "title": "Ring of Fire",
      "artist": "Johnny Cash",
      "year": 1963,
      "genre": "Folk / Country",
      "section": "Chorus",
      "bpm": 104,
      "originalKey": "G",
      "chords": ["D", "C", "G"],
      "insight": "Mariachi horns punctuate classic V–IV–I descending country resolve."
    },
    {
      "id": "tennessee-whiskey",
      "title": "Tennessee Whiskey",
      "artist": "Chris Stapleton",
      "year": 2015,
      "genre": "Folk / Country",
      "section": "Main Loop",
      "bpm": 49,
      "originalKey": "A",
      "chords": ["A", "Bm"],
      "insight": "Slow 6/8 groove proves two adjacent chords (I–ii) hold immense soul."
    },
    {
      "id": "wagon-wheel-turn",
      "title": "Brown Eyed Girl",
      "artist": "Van Morrison",
      "year": 1967,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 148,
      "originalKey": "G",
      "chords": ["G", "C", "G", "D"],
      "insight": "Twin guitar thirds trace I–IV–I–V with pure summer nostalgia."
    },
    {
      "id": "here-comes-the-sun",
      "title": "Here Comes the Sun",
      "artist": "The Beatles",
      "year": 1969,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 129,
      "originalKey": "A",
      "chords": ["A", "D", "E", "A"],
      "insight": "Capo 7 open D shapes sparkle brightly over sunny I–IV–V phrasing."
    },
    {
      "id": "yesterday",
      "title": "Yesterday",
      "artist": "The Beatles",
      "year": 1965,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 96,
      "originalKey": "F",
      "chords": ["F", "Em7", "A7", "Dm", "Bb", "C", "F"],
      "insight": "7-bar verse phrase uses a secondary V/vi (Em7–A7 -> Dm) for aching intimacy."
    },
    {
      "id": "something-beatles",
      "title": "Something",
      "artist": "The Beatles",
      "year": 1969,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 66,
      "originalKey": "C",
      "chords": ["C", "Cmaj7", "C7", "F", "D7", "G"],
      "insight": "Descending inner chromatic line (C -> B -> Bb -> A) makes the ballad flow like silk."
    },
    {
      "id": "hey-jude-verse",
      "title": "Hey Jude (Verse)",
      "artist": "The Beatles",
      "year": 1968,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 74,
      "originalKey": "F",
      "chords": ["F", "C", "C7", "F", "Bb", "F", "C", "F"],
      "insight": "Simple I–V–I–IV storytelling sets up the legendary Mixolydian coda."
    },
    {
      "id": "imagine",
      "title": "Imagine",
      "artist": "John Lennon",
      "year": 1971,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 76,
      "originalKey": "C",
      "chords": ["C", "Cmaj7", "F"],
      "insight": "Gentle I -> Imaj7 -> IV oscillation invites quiet reflection; chorus brings in F–G–C–E7."
    },
    {
      "id": "piano-man",
      "title": "Piano Man",
      "artist": "Billy Joel",
      "year": 1973,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 178,
      "originalKey": "C",
      "chords": ["C", "G", "F", "C", "F", "C", "D7", "G"],
      "insight": "Descending bass walk in 3/4 waltz time weaves through C–G/B–Am–C/G–F."
    },
    {
      "id": "tiny-dancer",
      "title": "Tiny Dancer",
      "artist": "Elton John",
      "year": 1971,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 145,
      "originalKey": "C",
      "chords": ["F", "G", "Em", "Am"],
      "insight": "Subdominant IV–V–iii–vi chorus lift rewards waiting through the gentle verse."
    },
    {
      "id": "rocket-man",
      "title": "Rocket Man",
      "artist": "Elton John",
      "year": 1972,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 137,
      "originalKey": "Gm",
      "chords": ["Em7", "A7", "Em7", "A7"],
      "insight": "Dorian i7–IV7 floating verse explodes into Bb–Eb–Cm–F chorus uplift."
    },
    {
      "id": "bohemian-rhapsody-ballad",
      "title": "Bohemian Rhapsody (Ballad)",
      "artist": "Queen",
      "year": 1975,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 72,
      "originalKey": "Bb",
      "chords": ["Bb", "Gm", "Cm", "F"],
      "insight": "Classic I–vi–ii–V ballad foundation dressed with contrapuntal piano fills."
    },
    {
      "id": "somebody-to-love",
      "title": "Somebody to Love",
      "artist": "Queen",
      "year": 1976,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 110,
      "originalKey": "Ab",
      "chords": ["Ab", "Eb", "Fm", "Bb7", "Eb"],
      "insight": "Gospel choir textures supercharge I–V–vi–V/V–V motion."
    },
    {
      "id": "dont-stop-me-now",
      "title": "Don't Stop Me Now",
      "artist": "Queen",
      "year": 1978,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 156,
      "originalKey": "F",
      "chords": ["F", "Gm", "Am", "Dm", "Gm", "C"],
      "insight": "Ascending stepwise diatonic chords mirror skyrocketing excitement."
    },
    {
      "id": "purple-rain",
      "title": "Purple Rain",
      "artist": "Prince",
      "year": 1984,
      "genre": "R&B / Soul",
      "section": "Verse",
      "bpm": 58,
      "originalKey": "Bb",
      "chords": ["Bb", "Gm", "F", "Eb"],
      "insight": "Add9 shimmer on Bb–Gm–F–Eb builds stadium-sized gospel soul."
    },
    {
      "id": "billie-jean",
      "title": "Billie Jean",
      "artist": "Michael Jackson",
      "year": 1982,
      "genre": "Pop",
      "section": "Verse",
      "bpm": 117,
      "originalKey": "F#m",
      "chords": ["F#m", "G#m", "A", "G#m"],
      "insight": "Iconic bassline grooves tightly underneath a hypnotic minor-scale chord shuttle."
    },
    {
      "id": "whats-going-on",
      "title": "What's Going On",
      "artist": "Marvin Gaye",
      "year": 1971,
      "genre": "R&B / Soul",
      "section": "Verse",
      "bpm": 102,
      "originalKey": "E",
      "chords": ["Emaj7", "C#m7"],
      "insight": "Lush maj7 and min7 voicings float effortlessly over James Jamerson's melodic bass."
    },
    {
      "id": "lets-stay-together",
      "title": "Let's Stay Together",
      "artist": "Al Green",
      "year": 1971,
      "genre": "R&B / Soul",
      "section": "Chorus",
      "bpm": 102,
      "originalKey": "F",
      "chords": ["Bb", "Am", "Gm", "C"],
      "insight": "Descending IV–iii–ii–V horn harmonies cradle Al Green's effortless falsetto."
    },
    {
      "id": "aint-no-sunshine",
      "title": "Ain't No Sunshine",
      "artist": "Bill Withers",
      "year": 1971,
      "genre": "R&B / Soul",
      "section": "Main Loop",
      "bpm": 79,
      "originalKey": "Am",
      "chords": ["Am", "Em", "G", "Am"],
      "insight": "Tight minor i–v–VII–i turnarounds give raw, conversational urgency."
    },
    {
      "id": "georgia-on-my-mind",
      "title": "Georgia on My Mind",
      "artist": "Ray Charles",
      "year": 1960,
      "genre": "Jazz / Standards",
      "section": "Verse",
      "bpm": 66,
      "originalKey": "F",
      "chords": ["F", "A7", "Dm", "Bb", "B°", "F", "G7", "C7"],
      "insight": "Diminished passing chord (#iv°) smoothly connects Bb up to F/C."
    },
    {
      "id": "all-of-me-standard",
      "title": "All of Me (Standard)",
      "artist": "Gerald Marks & Seymour Simons",
      "year": 1931,
      "genre": "Jazz / Standards",
      "section": "Verse",
      "bpm": 124,
      "originalKey": "C",
      "chords": ["Cmaj7", "E7", "A7", "Dm7"],
      "insight": "Classic secondary dominant chain (I -> V/vi -> V/ii -> ii) walks through the Circle of Fifths."
    },
    {
      "id": "blue-bossa",
      "title": "Blue Bossa",
      "artist": "Kenny Dorham",
      "year": 1963,
      "genre": "Jazz / Standards",
      "section": "Main Loop",
      "bpm": 144,
      "originalKey": "Cm",
      "chords": ["Cm7", "Fm7", "Dm7b5", "G7", "Cm7"],
      "insight": "Essential minor jazz-bossa form pairs minor iiø–V7–i with a brief half-step key lift."
    },
    {
      "id": "take-five-turn",
      "title": "Misty",
      "artist": "Erroll Garner",
      "year": 1954,
      "genre": "Jazz / Standards",
      "section": "Verse",
      "bpm": 68,
      "originalKey": "Eb",
      "chords": ["Ebmaj7", "Bbm7", "Eb7", "Abmaj7", "Abm7", "Db7"],
      "insight": "Turnaround to IV followed by parallel minor iv (Abm7–Db7 backdoor) is pure jazz romance."
    },
    {
      "id": "girl-from-ipanema",
      "title": "The Girl from Ipanema",
      "artist": "Stan Getz & João Gilberto",
      "year": 1964,
      "genre": "Jazz / Standards",
      "section": "Verse",
      "bpm": 128,
      "originalKey": "F",
      "chords": ["Fmaj7", "G7", "Gm7", "Gb7", "Fmaj7"],
      "insight": "Lydian II7 (G7) slides down through ii7 and tritone-sub ♭II7 (Gb7) back to Fmaj7."
    },
    {
      "id": "blackbird",
      "title": "Blackbird",
      "artist": "The Beatles",
      "year": 1968,
      "genre": "Folk / Country",
      "section": "Verse",
      "bpm": 94,
      "originalKey": "G",
      "chords": ["G", "Am", "G", "C", "A7", "D"],
      "insight": "Two-voice fingerpicked counterpoint ascends smoothly over an open G string pedal."
    },
    {
      "id": "dust-in-the-wind",
      "title": "Dust in the Wind",
      "artist": "Kansas",
      "year": 1977,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 94,
      "originalKey": "Am",
      "chords": ["C", "G", "Am", "G", "Dm7", "Am"],
      "insight": "Travis picking highlights subtle 9th and sus4 color changes over static roots."
    },
    {
      "id": "landslide",
      "title": "Landslide",
      "artist": "Fleetwood Mac",
      "year": 1975,
      "genre": "Folk / Country",
      "section": "Verse",
      "bpm": 160,
      "originalKey": "Eb",
      "chords": ["Eb", "Bb", "Cm", "Bb"],
      "insight": "Capo 3 C–G/B–Am7–G Travis pattern creates flowing step-wise comfort."
    },
    {
      "id": "american-pie",
      "title": "American Pie",
      "artist": "Don McLean",
      "year": 1971,
      "genre": "Folk / Country",
      "section": "Chorus",
      "bpm": 138,
      "originalKey": "G",
      "chords": ["G", "C", "G", "D"],
      "insight": "Storybook singalong alternates G–C–G–D with classic walking bass lines."
    },
    {
      "id": "stairway-bridge",
      "title": "Comfortably Numb",
      "artist": "Pink Floyd",
      "year": 1979,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 127,
      "originalKey": "D",
      "chords": ["D", "A", "G", "C", "G", "D"],
      "insight": "Chorus explodes from dark Bm verses into bright D–A–G–C–G–D Mixolydian warmth."
    },
    {
      "id": "wish-you-were-here",
      "title": "Wish You Were Here",
      "artist": "Pink Floyd",
      "year": 1975,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 62,
      "originalKey": "G",
      "chords": ["C", "D", "Am", "G", "D", "C", "Am", "G"],
      "insight": "Top two fingers locked on B & E strings create unifying acoustic sparkle."
    },
    {
      "id": "wonderwall-chorus",
      "title": "Don't Look Back in Anger",
      "artist": "Oasis",
      "year": 1995,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 82,
      "originalKey": "C",
      "chords": ["C", "G", "Am", "E", "F", "G", "C"],
      "insight": "Secondary dominant E (V/vi) bridges Am and F in a classic Britpop nod to Canon."
    },
    {
      "id": "iris-goo-goo-dolls",
      "title": "Iris",
      "artist": "Goo Goo Dolls",
      "year": 1998,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 156,
      "originalKey": "D",
      "chords": ["Bm", "A", "G"],
      "insight": "Waltzing 6/8 chorus sweeps downward from vi to V to IV with open-tuned drone strings."
    },
    {
      "id": "teardrop",
      "title": "Unchained Melody",
      "artist": "The Righteous Brothers",
      "year": 1965,
      "genre": "R&B / Soul",
      "section": "Verse",
      "bpm": 98,
      "originalKey": "C",
      "chords": ["C", "Am", "F", "G", "C"],
      "insight": "Sweeping 12/8 triplet arpeggios elevate simple I–vi–IV–V chords to operatic drama."
    },
    {
      "id": "cant-help-falling-in-love",
      "title": "Can't Help Falling in Love",
      "artist": "Elvis Presley",
      "year": 1961,
      "genre": "Pop",
      "section": "Verse",
      "bpm": 66,
      "originalKey": "D",
      "chords": ["D", "F#m", "Bm", "G", "D", "A"],
      "insight": "Gentle 6/8 sway moves from I through iii and vi before settling warmly on IV–I–V."
    },
    {
      "id": "valerie",
      "title": "Valerie",
      "artist": "Mark Ronson & Amy Winehouse",
      "year": 2007,
      "genre": "R&B / Soul",
      "section": "Verse",
      "bpm": 106,
      "originalKey": "Eb",
      "chords": ["Ebmaj7", "Fm7"],
      "insight": "Motown drum bounce makes a two-chord I–ii7 shuttle feel infinitely exciting."
    },
    {
      "id": "lose-yourself-to-dance",
      "title": "Uptown Funk",
      "artist": "Mark Ronson feat. Bruno Mars",
      "year": 2014,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 115,
      "originalKey": "Dm",
      "chords": ["Dm7", "G7"],
      "insight": "Tight Dorian i7–IV7 two-chord funk vamp drives the whole groove via rhythm and brass."
    },
    {
      "id": "o-ye-como-va",
      "title": "Oye Como Va",
      "artist": "Santana / Tito Puente",
      "year": 1970,
      "genre": "Rock",
      "section": "Main Loop",
      "bpm": 128,
      "originalKey": "Am",
      "chords": ["Am7", "D9"],
      "insight": "Classic Latin-rock Dorian i7–IV9 vamp creates rich modal lift on the F#."
    },
    {
      "id": "another-brick-in-the-wall",
      "title": "Another Brick in the Wall, Pt. 2",
      "artist": "Pink Floyd",
      "year": 1979,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 104,
      "originalKey": "Dm",
      "chords": ["Dm", "G", "Dm", "F", "C", "Dm"],
      "insight": "Chilled disco-rock Dorian groove pairs minor tension with bright F–C choir lift."
    },
    {
      "id": "wake-me-up-avicii",
      "title": "Wake Me Up",
      "artist": "Avicii",
      "year": 2013,
      "genre": "Electronic / Dance",
      "section": "Main Loop",
      "bpm": 124,
      "originalKey": "Bm",
      "chords": ["Bm", "G", "D", "A"],
      "insight": "Folk acoustic strumming blends seamlessly into an EDM vi–IV–I–V drop."
    },
    {
      "id": "closer-chainsmokers",
      "title": "Closer",
      "artist": "The Chainsmokers feat. Halsey",
      "year": 2016,
      "genre": "Electronic / Dance",
      "section": "Main Loop",
      "bpm": 95,
      "originalKey": "Ab",
      "chords": ["Db", "Eb", "Fm", "Eb"],
      "insight": "Pedal IV–V–vi–V shuttle creates catchy, repetitive pop hook energy."
    },
    {
      "id": "counting-stars",
      "title": "Counting Stars",
      "artist": "OneRepublic",
      "year": 2013,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 122,
      "originalKey": "C#m",
      "chords": ["C#m", "E", "B", "A"],
      "insight": "Acoustic driving loop balances urgent minor verse vocals with chorus bounce."
    },
    {
      "id": "stressed-out",
      "title": "Stressed Out",
      "artist": "Twenty One Pilots",
      "year": 2015,
      "genre": "Indie / Alt",
      "section": "Chorus",
      "bpm": 170,
      "originalKey": "Am",
      "chords": ["F", "Dm", "Am", "G"],
      "insight": "Starting the chorus on VI (F) -> iv (Dm) -> i (Am) -> VII (G) gives bittersweet longing."
    },
    {
      "id": "take-me-to-church",
      "title": "Take Me to Church",
      "artist": "Hozier",
      "year": 2013,
      "genre": "Indie / Alt",
      "section": "Chorus",
      "bpm": 129,
      "originalKey": "Em",
      "chords": ["Em", "C", "G", "B7"],
      "insight": "Chorus turns i–VI–III into a fiery harmonic-minor V7 (B7) slam back to Em."
    },
    {
      "id": "electric-feel",
      "title": "Sweater Weather",
      "artist": "The Neighbourhood",
      "year": 2012,
      "genre": "Indie / Alt",
      "section": "Chorus",
      "bpm": 124,
      "originalKey": "Eb",
      "chords": ["Cm", "Ab", "Eb", "Bb"],
      "insight": "Warm indie guitars over vi–IV–I–V give atmospheric late-night drive vibes."
    },
    {
      "id": "little-talks",
      "title": "Little Talks",
      "artist": "Of Monsters and Men",
      "year": 2011,
      "genre": "Indie / Alt",
      "section": "Main Loop",
      "bpm": 103,
      "originalKey": "Bbm",
      "chords": ["Bbm", "Gb", "Db", "Ab"],
      "insight": "Upbeat brass stabs turn a minor vi–IV–I–V progression into a celebratory march."
    },
    {
      "id": "rehab",
      "title": "Back to Black",
      "artist": "Amy Winehouse",
      "year": 2006,
      "genre": "R&B / Soul",
      "section": "Main Loop",
      "bpm": 62,
      "originalKey": "Dm",
      "chords": ["Dm", "Gm", "Bb", "A7"],
      "insight": "60s girl-group drama meets i–iv–VI–V7 harmonic minor tension."
    },
    {
      "id": "toxic-verse",
      "title": "My Funny Valentine",
      "artist": "Richard Rodgers & Lorenz Hart",
      "year": 1937,
      "genre": "Jazz / Standards",
      "section": "Verse",
      "bpm": 74,
      "originalKey": "Cm",
      "chords": ["Cm", "Cm7", "Abmaj7", "Fm7", "Dm7b5", "G7"],
      "insight": "Minor line cliché descends chromatically from root C -> B -> Bb -> A."
    },
    {
      "id": "blue-sky",
      "title": "Mr. Blue Sky",
      "artist": "Electric Light Orchestra",
      "year": 1977,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 178,
      "originalKey": "F",
      "chords": ["F", "Em7", "A7", "Dm", "Gm", "C"],
      "insight": "Joyful Beatlesque bass movement weaves through secondary dominant A7 -> Dm."
    },
    {
      "id": "everybody-wants-to-rule",
      "title": "Everybody Wants to Rule the World",
      "artist": "Tears for Fears",
      "year": 1985,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 112,
      "originalKey": "D",
      "chords": ["G", "A", "D"],
      "insight": "Shuffling 12/8 synth groove rides an infectious Mixolydian-tinged IV–V–I uplift."
    },
    {
      "id": "don-t-dream-its-over",
      "title": "Don't Dream It's Over",
      "artist": "Crowded House",
      "year": 1986,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 82,
      "originalKey": "Eb",
      "chords": ["Ab", "Bb", "Eb", "Cm"],
      "insight": "Chorus blooms on IV–V–I–vi, framing heartfelt vocals with ringing 7th extensions."
    },
    {
      "id": "jessie-s-girl",
      "title": "Jessie's Girl",
      "artist": "Rick Springfield",
      "year": 1981,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 132,
      "originalKey": "D",
      "chords": ["D", "A", "Bm", "G"],
      "insight": "Stop-start power chord punches energize the verse before flowing into a big chorus."
    },
    {
      "id": "africa-verse",
      "title": "The Scientist",
      "artist": "Coldplay",
      "year": 2002,
      "genre": "Indie / Alt",
      "section": "Main Loop",
      "bpm": 74,
      "originalKey": "F",
      "chords": ["Dm7", "Bb", "F", "C"],
      "insight": "Open piano voicings sustain vi7–IV–I–V (or F6/C) with heartbreaking simplicity."
    },
    {
      "id": "californication",
      "title": "Californication",
      "artist": "Red Hot Chili Peppers",
      "year": 1999,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 96,
      "originalKey": "Am",
      "chords": ["Am", "F", "Am", "F", "C", "G", "Dm", "Am"],
      "insight": "Minimalist i–VI shuttle opens up into a spacious major-lift chorus."
    },
    {
      "id": "scar-tissue",
      "title": "Otherside",
      "artist": "Red Hot Chili Peppers",
      "year": 1999,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 123,
      "originalKey": "Am",
      "chords": ["Am", "F", "C", "G"],
      "insight": "Interlocking guitar melody and vocal harmony give Am–F–C–G unmistakable drive."
    },
    {
      "id": "hurt-nin-cash",
      "title": "Hurt",
      "artist": "Nine Inch Nails / Johnny Cash",
      "year": 1994,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 90,
      "originalKey": "G",
      "chords": ["G", "Am", "F", "C"],
      "insight": "Chorus leans into warm V–vi–IV–I acoustic gravity after a dissonant tritone verse."
    },
    {
      "id": "nothing-else-matters",
      "title": "Nothing Else Matters",
      "artist": "Metallica",
      "year": 1991,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 69,
      "originalKey": "Em",
      "chords": ["Em", "D", "C", "G", "B7"],
      "insight": "Open-string 6/8 arpeggios sweep through natural minor before B7 pulls home."
    },
    {
      "id": "fade-into-you",
      "title": "Fade Into You",
      "artist": "Mazzy Star",
      "year": 1993,
      "genre": "Indie / Alt",
      "section": "Main Loop",
      "bpm": 78,
      "originalKey": "A",
      "chords": ["A", "E", "Bm"],
      "insight": "Hypnotic 3-chord I–V–ii waltz creates dreamy shoegaze nostalgia."
    },
    {
      "id": "wonderful-tonight",
      "title": "Wonderful Tonight",
      "artist": "Eric Clapton",
      "year": 1977,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 96,
      "originalKey": "G",
      "chords": ["G", "D", "C", "D"],
      "insight": "Lyrical guitar melody floats delicately over a gentle I–V–IV–V sway."
    },
    {
      "id": "knockin-on-heavens-door",
      "title": "Knockin' on Heaven's Door",
      "artist": "Bob Dylan",
      "year": 1973,
      "genre": "Folk / Country",
      "section": "Main Loop",
      "bpm": 69,
      "originalKey": "G",
      "chords": ["G", "D", "Am", "G", "D", "C"],
      "insight": "Alternating I–V–ii and I–V–IV endings creates natural 2-bar breathing space."
    },
    {
      "id": "sweet-caroline",
      "title": "Sweet Caroline",
      "artist": "Neil Diamond",
      "year": 1969,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 125,
      "originalKey": "B",
      "chords": ["B", "E", "F#"],
      "insight": "Brass punch lines frame pure I–IV–V build-up and timeless singalong energy."
    },
    {
      "id": "september-chorus",
      "title": "Shallow (Verse)",
      "artist": "Lady Gaga & Bradley Cooper",
      "year": 2018,
      "genre": "Folk / Country",
      "section": "Verse",
      "bpm": 96,
      "originalKey": "G",
      "chords": ["Em", "D", "G", "C", "G", "D"],
      "insight": "Fingerpicked acoustic progression builds quietly from Em toward the chorus lift."
    },
    {
      "id": "bad-guy-bridge",
      "title": "Ocean Eyes",
      "artist": "Billie Eilish",
      "year": 2015,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 72,
      "originalKey": "Em",
      "chords": ["C", "D", "Em", "G"],
      "insight": "Dreamy vocal stacks glide over VI–VII–i–III without ever feeling heavy."
    },
    {
      "id": "lovely-billie",
      "title": "lovely",
      "artist": "Billie Eilish & Khalid",
      "year": 2018,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 115,
      "originalKey": "Em",
      "chords": ["C", "Em", "B7"],
      "insight": "Dark piano and violin outline VI–i–V7 for haunting harmonic-minor tension."
    },
    {
      "id": "someone-you-loved-bridge",
      "title": "Stay",
      "artist": "The Kid LAROI & Justin Bieber",
      "year": 2021,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 170,
      "originalKey": "Db",
      "chords": ["Gb", "Ab", "Bbm", "Fm"],
      "insight": "Punchy synth hook rides IV–V–vi–iii with relentless hyperpop drive."
    },
    {
      "id": "take-me-out-chorus",
      "title": "Come Together",
      "artist": "The Beatles",
      "year": 1969,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 82,
      "originalKey": "Dm",
      "chords": ["Bm", "G", "A", "D"],
      "insight": "Chorus turns from swampy Dm blues into bright Bm–G–A–D release."
    },
    {
      "id": "let-it-go",
      "title": "Let It Go",
      "artist": "Idina Menzel / Kristen Anderson-Lopez",
      "year": 2013,
      "genre": "Pop",
      "section": "Chorus",
      "bpm": 137,
      "originalKey": "Ab",
      "chords": ["Ab", "Eb", "Fm", "Db"],
      "insight": "Broadway orchestration elevates I–V–vi–IV after a moody Fm–Db–Eb verse."
    },
    {
      "id": "bohemian-like-you",
      "title": "Save Your Tears",
      "artist": "The Weeknd",
      "year": 2020,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 118,
      "originalKey": "C",
      "chords": ["C", "Am", "Em", "G"],
      "insight": "Shimmering 80s synth arpeggio threads I–vi–iii–V into melancholic dance-pop."
    },
    {
      "id": "sunflower",
      "title": "Sunflower",
      "artist": "Post Malone & Swae Lee",
      "year": 2018,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 90,
      "originalKey": "D",
      "chords": ["D", "G", "Bm", "G"],
      "insight": "Warm lo-fi synth chords keep I–IV–vi–IV gentle and hypnotic."
    },
    {
      "id": "circles-post",
      "title": "Circles",
      "artist": "Post Malone",
      "year": 2019,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 120,
      "originalKey": "C",
      "chords": ["Cmaj7", "Fmaj7", "Fm", "C"],
      "insight": "Lush indie-pop groove lands on the emotional IV -> iv (Fmaj7 -> Fm) plagal cadence."
    },
    {
      "id": "heat-waves",
      "title": "Heat Waves",
      "artist": "Glass Animals",
      "year": 2020,
      "genre": "Indie / Alt",
      "section": "Main Loop",
      "bpm": 81,
      "originalKey": "B",
      "chords": ["G#m", "F#", "E", "C#m"],
      "insight": "Syncopated bass bounces across vi–V–IV–ii with hypnotic groove."
    },
    {
      "id": "die-with-a-smile",
      "title": "Die With a Smile",
      "artist": "Lady Gaga & Bruno Mars",
      "year": 2024,
      "genre": "Pop",
      "section": "Verse",
      "bpm": 79,
      "originalKey": "A",
      "chords": ["Amaj7", "Dmaj7", "C#m7", "F#m7", "Bm7", "E7"],
      "insight": "70s soul-ballad 7th chords cascade smoothly down through a ii–V turnaround."
    },
    {
      "id": "birds-of-a-feather",
      "title": "BIRDS OF A FEATHER",
      "artist": "Billie Eilish",
      "year": 2024,
      "genre": "Pop",
      "section": "Main Loop",
      "bpm": 105,
      "originalKey": "D",
      "chords": ["Dmaj7", "Bm7", "Em7", "A7"],
      "insight": "Crisp upbeat I–vi–ii–V with major7 shimmer sounds effortlessly modern."
    },
    {
      "id": "hotel-california-chorus",
      "title": "With a Little Help from My Friends",
      "artist": "The Beatles",
      "year": 1967,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 112,
      "originalKey": "E",
      "chords": ["E", "B", "F#m", "B", "E"],
      "insight": "Friendly stepwise melody leans on I–V–ii–V singalong clarity."
    },
    {
      "id": "claire-de-pop-my-way",
      "title": "Take Me to the River",
      "artist": "Al Green / Talking Heads",
      "year": 1974,
      "genre": "R&B / Soul",
      "section": "Chorus",
      "bpm": 98,
      "originalKey": "E",
      "chords": ["C", "D", "E"],
      "insight": "Borrowed ♭VI–♭VII–I 'Mario cadence' delivers triumphant rock-soul lift."
    },
    {
      "id": "with-a-little-help-chorus",
      "title": "Sgt. Pepper's Lonely Hearts Club Band (Reprise) / Ending",
      "artist": "The Beatles",
      "year": 1967,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 118,
      "originalKey": "G",
      "chords": ["Eb", "F", "G"],
      "insight": "Classic ♭VI–♭VII–I power cadence slams triumphantly onto tonic G."
    },
    {
      "id": "ps-i-love-you",
      "title": "P.S. I Love You",
      "artist": "The Beatles",
      "year": 1962,
      "genre": "Rock",
      "section": "Chorus",
      "bpm": 135,
      "originalKey": "D",
      "chords": ["Bb", "C", "D"],
      "insight": "Early Beatles signature ♭VI–♭VII–I cadence punctuates the title hook."
    },
    {
      "id": "every-day-i-write-the-book",
      "title": "Lean on Me",
      "artist": "Bill Withers",
      "year": 1972,
      "genre": "R&B / Soul",
      "section": "Verse",
      "bpm": 76,
      "originalKey": "C",
      "chords": ["C", "Dm", "Em", "F", "Em", "Dm", "C"],
      "insight": "Walking diatonic triads straight up and down the C major scale build instant gospel warmth."
    },
    {
      "id": "stairway-chorus-like-a-rolling-stone",
      "title": "Like a Rolling Stone",
      "artist": "Bob Dylan",
      "year": 1965,
      "genre": "Rock",
      "section": "Verse",
      "bpm": 95,
      "originalKey": "C",
      "chords": ["C", "Dm", "Em", "F", "G"],
      "insight": "Stepwise climbing C–Dm–Em–F–G leads straight into the booming IV–V chorus."
    },
    {
      "id": "my-way",
      "title": "My Way",
      "artist": "Frank Sinatra",
      "year": 1969,
      "genre": "Jazz / Standards",
      "section": "Verse",
      "bpm": 75,
      "originalKey": "D",
      "chords": ["D", "F#m", "Am", "B7", "Em", "A7", "D"],
      "insight": "Chromatic descending bass guides D -> C# -> C -> B into an unforgettable climax."
    }
  ];

  // Ensure helper normalizes chord strings consistently with Theory.parseChord
  function normalizeSongChords(chords) {
    return chords.map(function (sym) {
      var parsed = Theory.parseChord(sym);
      return {
        symbol: sym,
        rootPc: parsed ? parsed.rootPc : 0,
        baseQuality: parsed ? parsed.baseQuality : 'maj'
      };
    });
  }

  var NORMALIZED_SONGS = SONG_DB.map(function (song) {
    return {
      raw: song,
      normChords: normalizeSongChords(song.chords)
    };
  });

  function formatCleanChordName(rootPc, baseQuality, preferFlats) {
    var root = Theory.getNoteName(rootPc, preferFlats);
    if (baseQuality === 'min') return root + 'm';
    if (baseQuality === 'dim') return root + '°';
    return root;
  }

  function matchSingleSong(entry, userNorm, filters) {
    var S = entry.normChords;
    var m = S.length;
    var k = userNorm.length;
    if (m === 0 || k === 0) return null;

    var maxStart = filters.prefixOnly ? 1 : m;
    var bestMatch = null;

    for (var p = 0; p < maxStart; p++) {
      var delta = Theory.mod12(userNorm[0].rootPc - S[p].rootPc);
      if (filters.exactKeyOnly && delta !== 0) continue;

      var allMatch = true;
      for (var j = 0; j < k; j++) {
        var idx = (p + j) % m;
        if (Theory.mod12(S[idx].rootPc + delta) !== userNorm[j].rootPc ||
            S[idx].baseQuality !== userNorm[j].baseQuality) {
          allMatch = false;
          break;
        }
      }

      if (allMatch) {
        // Tier 1: p===0, delta===0; Tier 2: p===0, delta!==0; Tier 3: p>0, delta===0; Tier 4: p>0, delta!==0
        var tier = (p === 0 ? 0 : 2) + (delta === 0 ? 0 : 1) + 1;
        if (!bestMatch || tier < bestMatch.tier) {
          var matchedIndices = [];
          for (var x = 0; x < k; x++) {
            var pos = (p + x) % m;
            if (matchedIndices.indexOf(pos) === -1) matchedIndices.push(pos);
          }
          var nextIdx = (p + k) % m;
          var nextSongChord = S[nextIdx];
          var nextRootPc = Theory.mod12(nextSongChord.rootPc + delta);
          bestMatch = {
            song: entry.raw,
            startIndex: p,
            delta: delta,
            tier: tier,
            matchedIndices: matchedIndices,
            nextRootPc: nextRootPc,
            nextQuality: nextSongChord.baseQuality
          };
        }
      }
    }

    return bestMatch;
  }

  function decorateMatch(matchObj, preferFlats) {
    var song = matchObj.song;
    var transposedChords = song.chords.map(function (sym) {
      return Theory.transposeChordSymbol(sym, matchObj.delta, preferFlats);
    });
    var tierLabel = matchObj.tier === 1
      ? 'Exact Key • Starts Here'
      : matchObj.tier === 2
        ? 'Same Pattern • Transposed'
        : matchObj.tier === 3
          ? 'Exact Key • Mid-Loop'
          : 'Same Pattern • Mid-Loop';

    return {
      song: song,
      startIndex: matchObj.startIndex,
      delta: matchObj.delta,
      tier: matchObj.tier,
      tierLabel: tierLabel,
      matchedIndices: matchObj.matchedIndices,
      transposedChords: transposedChords,
      nextRootPc: matchObj.nextRootPc,
      nextQuality: matchObj.nextQuality,
      nextChordSymbol: formatCleanChordName(matchObj.nextRootPc, matchObj.nextQuality, preferFlats)
    };
  }

  function matchSongs(userChordObjs, filters, keyContext) {
    filters = filters || {};
    var preferFlats = keyContext ? keyContext.preferFlats : false;
    var genreFilter = filters.genre && filters.genre !== 'ALL' ? filters.genre : null;
    var search = (filters.search || '').trim().toLowerCase();

    var filteredPool = NORMALIZED_SONGS.filter(function (entry) {
      if (genreFilter && entry.raw.genre !== genreFilter) return false;
      if (search) {
        var hay = (entry.raw.title + ' ' + entry.raw.artist + ' ' + entry.raw.genre + ' ' + entry.raw.chords.join(' ')).toLowerCase();
        if (hay.indexOf(search) === -1) return false;
      }
      return true;
    });

    var userNorm = (userChordObjs || []).map(function (c) {
      return { rootPc: c.rootPc, baseQuality: c.baseQuality };
    });

    if (userNorm.length === 0) {
      var allItems = filteredPool.map(function (entry) {
        return {
          song: entry.raw,
          startIndex: 0,
          delta: 0,
          tier: 1,
          tierLabel: 'In Library • ' + entry.raw.originalKey,
          matchedIndices: [],
          transposedChords: entry.raw.chords.slice(),
          nextRootPc: entry.normChords[0].rootPc,
          nextQuality: entry.normChords[0].baseQuality,
          nextChordSymbol: entry.raw.chords[0]
        };
      });

      // Popular starter chord suggestions
      var starterMap = {};
      for (var i = 0; i < filteredPool.length; i++) {
        var first = filteredPool[i].normChords[0];
        var key = first.rootPc + ':' + first.baseQuality;
        if (!starterMap[key]) {
          starterMap[key] = {
            rootPc: first.rootPc,
            baseQuality: first.baseQuality,
            symbol: formatCleanChordName(first.rootPc, first.baseQuality, preferFlats),
            count: 0
          };
        }
        starterMap[key].count++;
      }
      var starterList = Object.keys(starterMap).map(function (k) {
        var item = starterMap[k];
        item.pct = Math.round((item.count / Math.max(1, filteredPool.length)) * 100);
        return item;
      }).sort(function (a, b) { return b.count - a.count; }).slice(0, 6);

      return {
        totalLibraryCount: SONG_DB.length,
        poolCount: filteredPool.length,
        matches: allItems,
        partialMatches: [],
        nextChordSuggestions: starterList
      };
    }

    var matches = [];
    for (var j = 0; j < filteredPool.length; j++) {
      var res = matchSingleSong(filteredPool[j], userNorm, filters);
      if (res) matches.push(decorateMatch(res, preferFlats));
    }

    matches.sort(function (a, b) {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return b.song.year - a.song.year;
    });

    // Aggregate next chord predictions across exact matches
    var nextCounts = {};
    for (var n = 0; n < matches.length; n++) {
      var mObj = matches[n];
      var nKey = mObj.nextRootPc + ':' + mObj.nextQuality;
      if (!nextCounts[nKey]) {
        nextCounts[nKey] = {
          rootPc: mObj.nextRootPc,
          baseQuality: mObj.nextQuality,
          symbol: mObj.nextChordSymbol,
          count: 0
        };
      }
      nextCounts[nKey].count++;
    }

    var nextSuggestions = Object.keys(nextCounts).map(function (k) {
      var entry = nextCounts[k];
      entry.pct = Math.round((entry.count / Math.max(1, matches.length)) * 100);
      return entry;
    }).sort(function (a, b) { return b.count - a.count; }).slice(0, 5);

    // Partial sub-combo fallback if >=3 chords pressed and 0 exact matches
    var partialMatches = [];
    if (matches.length === 0 && userNorm.length >= 3) {
      var tailNorm = userNorm.slice(-2);
      for (var t = 0; t < filteredPool.length; t++) {
        var pRes = matchSingleSong(filteredPool[t], tailNorm, filters);
        if (pRes) partialMatches.push(decorateMatch(pRes, preferFlats));
      }
      partialMatches.sort(function (a, b) { return a.tier - b.tier; });
    }

    return {
      totalLibraryCount: SONG_DB.length,
      poolCount: filteredPool.length,
      matches: matches,
      partialMatches: partialMatches.slice(0, 12),
      nextChordSuggestions: nextSuggestions
    };
  }

  function getGenres() {
    var seen = {};
    var genres = [];
    for (var i = 0; i < SONG_DB.length; i++) {
      var g = SONG_DB[i].genre;
      if (!seen[g]) {
        seen[g] = true;
        genres.push(g);
      }
    }
    genres.sort();
    return genres;
  }

  NS.Songs = {
    SONG_DB: SONG_DB,
    matchSongs: matchSongs,
    getGenres: getGenres
  };
})(window);
