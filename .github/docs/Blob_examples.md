# Vercel Blob examples

Vercel Blob is available on [all plans](/docs/plans)

Those with the [owner, member, developer](/docs/rbac/access-roles#owner, member, developer-role) role can access this feature

## [Range requests](#range-requests)

Vercel Blob supports [range requests](https://developer.mozilla.org/docs/Web/HTTP/Range_requests) for partial downloads. This means you can download only a portion of a blob, here are examples:

Terminal

```
# First 4 bytes
curl -r 0-3 https://1sxstfwepd7zn41q.public.blob.vercel-storage.com/pi.txt
# 3.14
 
# Last 5 bytes
curl -r -5 https://1sxstfwepd7zn41q.public.blob.vercel-storage.com/pi.txt
# 58151
 
# Bytes 3-6
curl -r 3-6 https://1sxstfwepd7zn41q.public.blob.vercel-storage.com/pi.txt
# 4159
```

## [Upload progress](#upload-progress)

You can track the upload progress when uploading blobs with the `onUploadProgress` callback:

```
const blob = await upload('big-file.mp4', file, {
  access: 'public',
  handleUploadUrl: '/api/upload',
  onUploadProgress: (progressEvent) => {
    console.log(`Loaded ${progressEvent.loaded} bytes`);
    console.log(`Total ${progressEvent.total} bytes`);
    console.log(`Percentage ${progressEvent.percentage}%`);
  },
});
```

`onUploadProgress` is available on `put` and `upload` methods.

## [Aborting requests](#aborting-requests)

Every Vercel Blob operation can be canceled, just like a fetch call. This is useful when you want to abort an ongoing operation, for example, when a user navigates away from a page or when the request takes too long.

```
const abortController = new AbortController();
 
try {
  const blobPromise = vercelBlob.put('hello.txt', 'Hello World!', {
    access: 'public',
    abortSignal: abortController.signal,
  });
 
  const timeout = setTimeout(() => {
    // Abort the request after 1 second
    abortController.abort();
  }, 1000);
 
  const blob = await blobPromise;
 
  console.info('blob put request completed', blob);
 
  clearTimeout(timeout);
 
  return blob.url;
} catch (error) {
  if (error instanceof vercelBlob.BlobRequestAbortedError) {
    // Handle the abort
    console.info('canceled put request');
  }
 
  // Handle other errors
}
```

## [Deleting all blobs](#deleting-all-blobs)

If you want to delete all the blobs in your store you can use the following code snippet to delete them in batches. This is useful if you have a lot of blobs and you want to avoid hitting the rate limits.

Either execute this code in a [Vercel Cron Job](/docs/cron-jobs), as a serverless function or on your local machine.

```
import { list, del, BlobServiceRateLimited } from '@vercel/blob';
import { setTimeout } from 'node:timers/promises';
 
async function deleteAllBlobs() {
  let cursor: string | undefined;
  let totalDeleted = 0;
 
  // Batch size to respect rate limits (conservative approach)
  const BATCH_SIZE = 100; // Conservative batch size
  const DELAY_MS = 1000; // 1 second delay between batches
 
  do {
    const listResult = await list({
      cursor,
      limit: BATCH_SIZE,
    });
 
    if (listResult.blobs.length > 0) {
      const batchUrls = listResult.blobs.map((blob) => blob.url);
 
      // Retry logic with exponential backoff
      let retries = 0;
      const maxRetries = 3;
 
      while (retries <= maxRetries) {
        try {
          await del(batchUrls);
          totalDeleted += listResult.blobs.length;
          console.log(
            `Deleted ${listResult.blobs.length} blobs (${totalDeleted} total)`,
          );
          break; // Success, exit retry loop
        } catch (error) {
          retries++;
 
          if (retries > maxRetries) {
            console.error(
              `Failed to delete batch after ${maxRetries} retries:`,
              error,
            );
            throw error; // Re-throw after max retries
          }
 
          // Exponential backoff: wait longer with each retry
          let backoffDelay = 2 ** retries * 1000;
 
          if (error instanceof BlobServiceRateLimited) {
            backoffDelay = error.retryAfter * 1000;
          }
 
          console.warn(
            `Retry ${retries}/${maxRetries} after ${backoffDelay}ms delay`,
          );
 
          await setTimeout(backoffDelay);
        }
 
        await setTimeout(DELAY_MS);
      }
    }
 
    cursor = listResult.cursor;
  } while (cursor);
 
  console.log(`All blobs were deleted. Total: ${totalDeleted}`);
}
 
deleteAllBlobs().catch((error) => {
  console.error('An error occurred:', error);
});
```

## [Backups](#backups)

While there's no native backup system for Vercel Blob, here are two ways to backup your blobs:

1.  Continuous backup: When using [Client Uploads](/docs/storage/vercel-blob/using-blob-sdk#client-uploads) you can leverage the `onUploadCompleted` callback from the `handleUpload` server-side function to save every Blob upload to another storage.
2.  Periodic backup: Using [Cron Jobs](/docs/cron-jobs) and the [Vercel Blob SDK](/docs/storage/vercel-blob/using-blob-sdk) you can periodically list all blobs and save them.

Here's an example implementation of a periodic backup as a Cron Job:

```
import { Readable } from 'node:stream';
import { S3Client } from '@aws-sdk/client-s3';
import { list } from '@vercel/blob';
import { Upload } from '@aws-sdk/lib-storage';
import type { NextRequest } from 'next/server';
import type { ReadableStream } from 'node:stream/web';
 
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }
 
  const s3 = new S3Client({
    region: 'us-east-1',
  });
 
  let cursor: string | undefined;
 
  do {
    const listResult = await list({
      cursor,
      limit: 250,
    });
 
    if (listResult.blobs.length > 0) {
      await Promise.all(
        listResult.blobs.map(async (blob) => {
          const res = await fetch(blob.url);
          if (res.body) {
            const parallelUploads3 = new Upload({
              client: s3,
              params: {
                Bucket: 'vercel-blob-backup',
                Key: blob.pathname,
                Body: Readable.fromWeb(res.body as ReadableStream),
              },
              leavePartsOnError: false,
            });
 
            await parallelUploads3.done();
          }
        }),
      );
    }
 
    cursor = listResult.cursor;
  } while (cursor);
 
  return new Response('Backup done!');
}
```

This script optimizes the process by streaming the content directly from Vercel Blob to the backup storage, avoiding buffering all the content into memory.

You can split your backup process into smaller chunks if you're hitting an execution limit. In this case you would save the `cursor` to a database and resume the backup process from where it left off.