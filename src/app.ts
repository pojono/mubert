// month.js (ES Module)
import axios from 'axios';

import { monthFromDate } from './month-from-date.js';

const dateString = '2022-03-01';

console.log(monthFromDate(dateString));

// Function to create a PAT for a user
async function createPAT(
  email: string | undefined,
  phone: string | undefined,
  customId: string,
  license: string,
  token: string,
): Promise<string> {
  const url = 'https://api-b2b.mubert.com/v2/GetServiceAccess';
  const data = {
    method: 'GetServiceAccess',
    params: {
      email,
      phone,
      custom_id: customId,
      license,
      token,
    },
  };

  const response = await axios.post(url, data);
  const pat = response.data.data.pat;
  return pat;
}

// Function to get the list of available music channels
async function getMusicChannels(pat: string): Promise<any> {
  const url = 'https://api-b2b.mubert.com/v2/GetPlayMusic';
  const data = {
    method: 'GetPlayMusic',
    params: {
      pat,
    },
  };

  const response = await axios.post(url, data);
  const channels = response.data.data.categories[1].groups[0].channels[0];
  return channels;
}

async function generateMP3(
  pat: string,
  playlist: string,
  duration: number,
): Promise<string> {
  const url = 'https://api-b2b.mubert.com/v2/RecordTrack';
  const data = {
    method: 'RecordTrack',
    params: {
      pat,
      playlist,
      duration,
      format: 'mp3',
      intensity: 'high',
      mode: 'track',
    },
  };

  const response = await axios.post(url, data);
  const task = response.data.data.tasks[0];
  const taskId = task.task_id;
  const downloadLink = task.download_link;

  // Wait for the track to be generated
  await waitForTrackGeneration(pat, taskId);

  return downloadLink;
}

// Function to wait for the track generation to complete
async function waitForTrackGeneration(
  pat: string,
  taskId: string,
): Promise<void> {
  const url = 'https://api-b2b.mubert.com/v2/TrackStatus';
  const data = {
    method: 'TrackStatus',
    params: {
      // task_id: taskId,
      pat,
    },
  };

  while (true) {
    const response = await axios.post(url, data);

    if (response.data.error) {
      throw new Error(
        `Check task status Error ${response.data.error.code} ${response.data.error.text}`,
      );
    }

    const task = response.data.data.tasks.find((_task: any) => {
      return _task.task_id === taskId;
    });
    const taskStatus = task.task_status_code;

    if (taskStatus === 2) {
      // Track generation is complete
      break;
    } else if (taskStatus === 3) {
      // Track generation failed
      throw new Error('Track generation failed');
    }

    // Wait for 1 second before checking again
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function main(): Promise<void> {
  try {
    const pat = await createPAT(undefined, undefined, '4', LICENSE, TOKEN);
    console.log('PAT:', pat);

    const channels = await getMusicChannels(pat);
    console.log('Music Channels:', channels);

    // const playlist = '5.2.0';
    // const duration = 180;
    // const downloadLink = await generateMP3(pat, playlist, duration);
    // console.log('Download Link:', downloadLink);
  } catch (error) {
    console.error('Error:', (error as Error).message);
  }
}

(async (): Promise<void> => {
  await main();
})();
