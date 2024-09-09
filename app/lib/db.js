import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

async function openDb() {
  if (!db) {
    db = await open({
      filename: './colleagues.sqlite',
      driver: sqlite3.Database
    });
  }
  return db;
}

// Initialize the database
async function initializeDb() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS colleagues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      photo TEXT,
      descriptions TEXT NOT NULL
    )
  `);
}

// Function to insert test data
async function insertTestData() {
  const db = await openDb();
  const count = await db.get('SELECT COUNT(*) as count FROM colleagues');
//   await db.exec('DROP TABLE IF EXISTS colleagues');
  
  if (count.count === 0) {
    const testData = [
      {
        name: 'Tom',
        photo: '',
        descriptions: ['A true native Groninger', 'Car enthusiast that may or may not know how to use indicators', 'Built a unique finance tool to consolidate all finances','Heavily believes in punctuality','Has a very serious resting face but likes to make jokes']
      },
      {
        name: 'Frank',
        photo: '',
        descriptions: ['Has a little sister that has graduated in law', 'Very calm demeanor and is usually last to leave the office', 'Started off as a designer and is now part of development','Has a mini petting zoo at home (two cats and a rabbit)','Car enthusiast that only has VW cars']
      },
      {
        name: 'Ido',
        photo: '',
        descriptions: ['Methodical and calculated when working with the code base','Doesn\'t say much but always willing to help','Used to operate his own software development company before joining global tickets']
      },
      {
        name: 'Vishant',
        photo: '',
        descriptions: ['Can go the the whole day without hearing his voice','Not a lover of meat','Highly experienced in his role but also very family oriented']
      },
      {
        name: 'Rico',
        photo: '',
        descriptions: ['Brews his own beer','Invested in his own happiness and quality of life','Loves to spend time with his wife','Had a very successful startup','Tries his best to stay away from front end development - doesn\'t like css']
      },
      {
        name: 'Casper',
        photo: '',
        descriptions: ['Keep it simple - new and shiny is not always better','Orchestrate projects from Lagos, Nigeria']
      }
    ];
    
    const stmt = await db.prepare('INSERT INTO colleagues (name, photo, descriptions) VALUES (?, ?, ?)');
    for (const colleague of testData) {
      await stmt.run(colleague.name, colleague.photo, JSON.stringify(colleague.descriptions));
    }
    await stmt.finalize();
    
    console.log('Test data inserted successfully');
  }
}

// Call the function to initialize the database and insert test data
initializeDb().then(() => insertTestData());

export async function getColleagues() {
  const db = await openDb();
  const colleagues = await db.all('SELECT * FROM colleagues');
  return colleagues.map(colleague => {
    let descriptions = [];
    try {
      descriptions = JSON.parse(colleague.descriptions);
    } catch (error) {
      console.error(`Error parsing descriptions for colleague ${colleague.id}:`, error);
    }
    return {
      ...colleague,
      descriptions: Array.isArray(descriptions) ? descriptions : []
    };
  });
}

export async function addColleague(name, photo, descriptions) {
  const db = await openDb();
  const result = await db.run(
    'INSERT INTO colleagues (name, photo, descriptions) VALUES (?, ?, ?)',
    [name, photo, JSON.stringify(descriptions)]
  );
  return { id: result.lastID, name, photo, descriptions };
}

export async function updateColleague(id, name, photo, descriptions) {
  const db = await openDb();
  await db.run(
    'UPDATE colleagues SET name = ?, photo = ?, descriptions = ? WHERE id = ?',
    [name, photo, JSON.stringify(descriptions), id]
  );
  return { id, name, photo, descriptions };
}

export async function deleteColleague(id) {
  const db = await openDb();
  await db.run('DELETE FROM colleagues WHERE id = ?', [id]);
}