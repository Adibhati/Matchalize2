import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import { BRANCHES, YEARS, GENDERS, INTENTS, INTEREST_TAGS, COLLEGE_MAP } from './config/appData.js';

dotenv.config();

const COLLEGE_CODE = 'iitb';
const COLLEGE_NAME = COLLEGE_MAP[COLLEGE_CODE];

const testUsers = [
  {
    email: 'alice@iitb.ac.in',
    name: 'Alice Sharma',
    age: 20,
    gender: 'Female',
    pronouns: 'she/her',
    branch: BRANCHES[0],
    year: YEARS[2],
    hostel: 'Hostel 1',
    bio: 'Coffee addict, late night library explorer, and always down for a chai walk between lectures.',
    prompts: [
      { question: 'My favorite spot to hide on campus...', answer: 'The tiny reading nook on the 3rd floor of the library. No one knows about it.' },
      { question: 'My ideal night study session includes...', answer: 'Filter coffee, lo-fi beats, and my noise-cancelling headphones.' },
    ],
    photos: [],
    intent: ['Dating'],
    interestedIn: ['Male'],
    ageRange: { min: 19, max: 25 },
    interests: ['Reading', 'Coffee', 'Music Production', 'Trekking'],
  },
  {
    email: 'bob@iitb.ac.in',
    name: 'Bob Patel',
    age: 21,
    gender: 'Male',
    pronouns: 'he/him',
    branch: BRANCHES[2],
    year: YEARS[2],
    hostel: 'Hostel 4',
    bio: 'Cricket, code, and chai. The three Cs of my life. Ask me about my hackathon projects.',
    prompts: [
      { question: 'Choose me if you want to survive...', answer: 'Hackathon all-nighters. I know every canteen that stays open past midnight.' },
      { question: 'Late night chai or early morning library?', answer: 'Late night chai without a second thought.' },
    ],
    photos: [],
    intent: ['Dating', 'Friends'],
    interestedIn: ['Female', 'Male'],
    ageRange: { min: 19, max: 24 },
    interests: ['Coding', 'Cricket', 'Chai Walks', 'Gaming', 'Hackathons'],
  },
  {
    email: 'carol@iitb.ac.in',
    name: 'Carol Desai',
    age: 19,
    gender: 'Female',
    pronouns: 'she/her',
    branch: BRANCHES[1],
    year: YEARS[1],
    hostel: 'Hostel 2',
    bio: 'Math nerd by day, anime binge-watcher by night. Currently learning guitar.',
    prompts: [
      { question: 'My vibe is best described as...', answer: 'Chaotic good with a side of existential math jokes.' },
    ],
    photos: [],
    intent: ['Dating', 'Study Buddy'],
    interestedIn: ['Male', 'Non-binary'],
    ageRange: { min: 18, max: 23 },
    interests: ['Anime', 'Guitar', 'Math', 'UI/UX Design'],
  },
  {
    email: 'dave@iitb.ac.in',
    name: 'Dave Gupta',
    age: 22,
    gender: 'Male',
    pronouns: 'he/him',
    branch: BRANCHES[3],
    year: YEARS[3],
    hostel: 'Hostel 3',
    bio: 'Photography, filmmaking, and finding the best filter coffee on campus. Dual degree survivor.',
    prompts: [
      { question: 'A hot take I have about our college...', answer: 'The lake view at sunset is better than any hostel room AC.' },
    ],
    photos: [],
    intent: ['Dating', 'Friends'],
    interestedIn: ['Female', 'Male'],
    ageRange: { min: 19, max: 26 },
    interests: ['Photography', 'Filter Coffee', 'Movies', 'Travel & Trekking', 'Startups'],
  },
  {
    email: 'eve@iitb.ac.in',
    name: 'Eve Nair',
    age: 20,
    gender: 'Non-binary',
    pronouns: 'they/them',
    branch: BRANCHES[4],
    year: YEARS[2],
    hostel: 'Hostel 5',
    bio: 'Mechanical engineering by major, poetry by passion. Looking for deep convos at 2am.',
    prompts: [
      { question: 'My hidden talent...', answer: 'I can identify any bolt or screw size by touch. Also, I write spoken word.' },
    ],
    photos: [],
    intent: ['Dating', 'Friends', 'Study Buddy'],
    interestedIn: ['Male', 'Female', 'Non-binary'],
    ageRange: { min: 19, max: 25 },
    interests: ['Poetry & Writing', 'Travel & Trekking', 'Fitness', 'Art'],
  },
  {
    email: 'frank@iitb.ac.in',
    name: 'Frank Joseph',
    age: 21,
    gender: 'Male',
    pronouns: 'he/him',
    branch: BRANCHES[5],
    year: YEARS[2],
    hostel: 'Hostel 6',
    bio: 'Chemical engineer who can cook. Yes, we exist. Looking for my canteen partner in crime.',
    prompts: [
      { question: 'Meet me at the canteen if...', answer: 'You want to try the best Maggi hack Ive perfected over 2 years of hostel life.' },
    ],
    photos: [],
    intent: ['Dating', 'Study Buddy'],
    interestedIn: ['Female', 'Male', 'Non-binary'],
    ageRange: { min: 18, max: 24 },
    interests: ['Cooking', 'Fitness', 'Games', 'Night Canteen'],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const userData of testUsers) {
      await User.findOneAndUpdate(
        { email: userData.email },
        {
          ...userData,
          college: COLLEGE_NAME,
          collegeCode: COLLEGE_CODE,
          isVerified: true,
          isOnboarded: true,
          lastActive: new Date(),
        },
        { upsert: true, new: true }
      );
      console.log(`Seeded: ${userData.name} (${userData.email})`);
    }

    console.log(`\nDone! ${testUsers.length} test users created.`);
    console.log('Users can log in by completing OTP verification at their email.');
    console.log('In dev mode (no SMTP), check server console for OTP codes.\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
