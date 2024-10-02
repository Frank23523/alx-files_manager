import Bull from 'bull';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import { promisify } from 'util';
import dbClient from './utils/db';

const fileQueue = new Bull('fileQueue');
const userQueue = new Bull('userQueue');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

async function generateThumbnail(path, width) {
  const sharp = await import('sharp');
  const imageBuffer = await readFile(path);
  const thumbnailBuffer = await sharp
    .default(imageBuffer)
    .resize({ width, height: width, fit: 'inside' })
    .toBuffer();
  const thumbnailPath = `${path}_${width}`;
  await writeFile(thumbnailPath, thumbnailBuffer);
}

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.db.collection('files').findOne({
    _id: ObjectId(fileId),
    userId: ObjectId(userId),
  });

  if (!file) {
    throw new Error('File not found');
  }

  const sizes = [500, 250, 100];
  for (const size of sizes) {
    await generateThumbnail(file.localPath, size);
  }
});

userQueue.process(async (job) => {
  const { userId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  const user = await dbClient.db
    .collection('users')
    .findOne({ _id: ObjectId(userId) });

  if (!user) {
    throw new Error('User not found');
  }

  console.log(`Welcome ${user.email}!`);
});

console.log('Worker is running');
