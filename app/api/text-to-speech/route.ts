import { NextRequest, NextResponse } from 'next/server';
import * as dotenv from 'dotenv';

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; 
if (!ELEVENLABS_API_KEY) {
  throw new Error("Missing ELEVENLABS_API_KEY in environment variables");
}

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      console.error('Text is required');
      return new Response(JSON.stringify({ error: 'Text is required' }), { status: 400 });
    }

    const headers = new Headers({
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY!,
    });

    const body = JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      output_format: "mp3_44100_128"
    });

    console.log('Sending request to ElevenLabs with body:', body);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error('Error response from ElevenLabs:', errorResponse);
      return new Response(JSON.stringify({ error: errorResponse.detail }), { status: response.status });
    }

    const reader = response.body?.getReader();
    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close();
          return;
        }
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      },
      cancel() {
        reader?.cancel();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in text-to-speech route:', error.message);
      return new Response(JSON.stringify({ error: 'Failed to generate audio', details: error.message }), {
        status: 500,
      });
    }
    console.error('Unknown error in text-to-speech route:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate audio', details: 'Unknown error' }), {
      status: 500,
    });
  }
}
