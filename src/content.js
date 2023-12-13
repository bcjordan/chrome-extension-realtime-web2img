import src from './sand.jpg'
import './content.css'

// On press period, shift to next prompt by incrementing startTime
// On press comma, shift to previous prompt by decrementing startTime
let startTime = +new Date();
document.addEventListener('keydown', (e) => {
  if (e.key === '.') {
    console.log('next prompt');
    startTime = startTime - 2000;
  } else if (e.key === ',') {
    console.log('prev prompt');
    startTime = Math.max(startTime - 2000, 0);
  }
});

const html = `
<div class="crx">
  <img id="preview" src="${chrome.runtime.getURL(src)}" />
<!--  <img src="https://vitejs.dev/logo.svg" />-->
</div>
`

const doc = new DOMParser().parseFromString(html, 'text/html')
document.body.append(doc.body.firstElementChild)
const previewRef = document.getElementById('preview');

const previewMaxSize = '512px';
const previewMinSize = '256px';

previewRef.style.width = previewMaxSize;
previewRef.style.height = previewMaxSize;
previewRef.style.opacity = '1';

previewRef.onclick = () => {
  // toggle vis
  console.log(previewRef.style.opacity)
  previewRef.style.opacity = previewRef.style.opacity === '1' ? '.25' : '1';
  previewRef.style.width = previewRef.style.width === previewMaxSize ? previewMinSize : previewMaxSize;
  previewRef.style.height = previewRef.style.height === previewMaxSize ? previewMinSize : previewMaxSize;
}

let n = 0;

function snapVideo(el) {
  var targetHeight;
  var targetWidth;
  var resizeCanvas = document.createElement("canvas");
  resizeCanvas.width = 512;
  resizeCanvas.height = 512;
  var ctx = resizeCanvas.getContext('2d');
  // ctx.drawImage(el, 0,0, el.videoWidth, el.videoHeight,0,0, 512, 512);
  // calculate aspect ratio
  var aspectRatio = el.videoWidth / el.videoHeight;
  if (el.videoWidth > el.videoHeight) {
    // landscape
    targetWidth = resizeCanvas.width;
    targetHeight = resizeCanvas.width / aspectRatio;
  } else {
    // portrait
    targetWidth = resizeCanvas.height * aspectRatio;
    targetHeight = resizeCanvas.height;
  }
  // center the image
  var targetX = resizeCanvas.width / 2 - targetWidth / 2;
  var targetY = resizeCanvas.height / 2 - targetHeight / 2;
  // draw the image
  ctx.drawImage(el, targetX, targetY, targetWidth, targetHeight);

  var du = resizeCanvas.toDataURL('image/png')
  // destroy
  resizeCanvas.remove()
  return du;


}

function snapCanvas(canvasElement) {
  // const originalWidth = canvasElement.width;
  // const originalHeight = canvasElement.height;
  canvasElement.preserveDrawingBuffer = true;
  canvasElement.willReadFrequently = true;

  // canvasElement.width = 512;
  // canvasElement.height = 512;
  // canvasElement.style.height = '512px';
  // canvasElement.style.width = '512px';
  // canvasElement.style.transform = `rotate(${++n}deg)` // they will know us by our continuous rotation
  // let url = canvasElement.toDataURL('image/png');

  var resizedCanvas = document.createElement("canvas");
  var resizedContext = resizedCanvas.getContext("2d");

  resizedCanvas.height = "512";
  resizedCanvas.width = "512";

  // var canvas = document.getElementById("original-canvas");

  resizedContext.drawImage(canvasElement, 0, 0, canvasElement.width, canvasElement.height, 0,0, 512, 512);
  var myResizedData = resizedCanvas.toDataURL();
  resizedCanvas.remove()

  // restore
  // canvasElement.width = originalWidth;
  // canvasElement.height = originalHeight;
  // canvasElement.style.height = `${originalHeight}px`;
  // canvasElement.style.width = `${originalWidth}px`;
  return myResizedData;
}

// Make period alternat prompts
const prompts = [
  'two 1920s men in suits with big fake handlebar mustaches',
  'a cat with a human face',
  'two men on construction site with a jackhammer',
  'two astronauts floating in space outside a spacecraft',
  'a medieval knight riding a bicycle',
  'a futuristic cityscape with flying cars',
  'a chef preparing sushi in a modern kitchen',
  'a group of children playing in a treehouse',
  'an underwater scene with a scuba diver and a giant octopus',
  'a fantasy landscape with a dragon and a castle'
];

let rotate = () => {
  const canvasElement = document.querySelector('canvas')
  // console.log(el)
  // el.width = 512;
  // el.height = 512;


  const videoElement = document.querySelector('video')

  if (n % 60 === 0 && (!!videoElement || !!canvasElement)) {
    window.canvas = canvasElement;

    const imageUrl = videoElement ? snapVideo(videoElement) : snapCanvas(canvasElement);

    // console.log(imageUrl);
    const rqid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    requestsById[rqid] = imageUrl;

    // Only if localStorage.getItem('lcm') === 'true'
    chrome.storage.local.get(['lcm'], function(result) {
      if (result.lcm) {
        let timeSinceStart = +new Date() - startTime;
        console.log(timeSinceStart)
        let epochs = Math.floor(timeSinceStart / 2000);
        console.log(epochs)
        connection.send({
          // Set id
          request_id: // unique id for this request, used to match up with response
            rqid,
          // snag a canvas' data URL usng e.g. threeJSRenderer.domElement.toDataURL("image/png"); or canvas.toDataURL("image/png");
          // NOTE: ensure your input is 512x512. Other sizes may negatively impact inference performance.
          image_url: imageUrl,
          sync_mode: true,
          // Mess with prompt here, text box would be awesome (could even go in main.js popup instead of content)
          // Pick prompt based on startTime modulus every 5 seconds from prompts size
          prompt: prompts[epochs % prompts.length],
          strength: 0.35,
          num_inference_steps: 8,
          seed: 1234,
          // if you want it to not have consistency across frames / re-roll dice:
          // seed: Math.abs(Math.floor(Math.random() * 100000)),
          enable_safety_checks: false,
        })
        
      } else {
        chrome.runtime.sendMessage({imageURL: null, sourceImageURL: requestsById[rqid]});
      }
    });
  }

  requestAnimationFrame(rotate);
};
requestAnimationFrame(rotate);
// var canvas = document.querySelector("canvas");
// // get the context
// console.log(canvas);

// First, auth client with fal
// WARNING: You shouldn't do this from the web client directly as it exposes your fal API key.
//    To offer to web visitors you should auth with backend using their API (https://github.com/tldraw/tldraw does this)
//        see https://github.com/fal-ai/serverless-js#the-fal-client-proxy for sample of how to hook up with e.g. nextjs on vercel as backend
//        this won't impact realtime performance (it just passes a token during socket auth instead)
import * as fal from "@fal-ai/serverless-client";
fal.config({
  credentials: import.meta.env.VITE_FAL_AI_KEY // get at https://www.fal.ai/dashboard/keys
  // track usage / set limits at https://www.fal.ai/dashboard/usage
})

const requestsById = {};

// Connect to fal realtime endpoint. As of December 4th, 2023, this is the fastest.
const connection = fal.realtime.connect('110602490-lcm-sd15-i2i', {
  connectionKey: 'realtime-connection-key',
  clientOnly: false,
  // if you want to use fal's default throttling, you might be able to just raise this value.
  //   but see below for sample of adaptive request timing (feels better for partially-interactive continuous i2i)
  throttleInterval: 150,
  onError: (error) => {
    // Re-set-up needed? Not sure
    console.error(error)
  },
  onResult: (result) => {
    if (result.images && result.images[0]) {
      let imageURL = result.images[0].url;
      console.log(result) // - this is your image, base64 encoded jpeg
      chrome.runtime.sendMessage({imageURL: imageURL, sourceImageURL: requestsById[result.request_id]});
      // Set to #preview
      document.querySelector('#preview').src = imageURL;

      // for my drawing app I aiImageQueue.push new images into a queue/aiImageQueue.shift from a queue so they don't "bunch up" when I render
      // aiImageQueue.push(result.images[0].url);
    }
  },
});

// Send image from canvas to fal


//
// advanced stuff for perf juicers, accurate as of December 4th, 2023
//

// Calculates # of steps to run with gradual up-scaling.
// IMPORTANT: be sure to use dynamic timeouts like with getTimeoutForRequests() if using this technique

// If you just want non-interactive realtime or don't care about juicing later quality,
//    just return a constant # of steps instead (start low to figure out highest framerate possible)
//    getTimeoutForRequests() is a good starting point for ideal request delay though maybe conservative at
//    higher qualities
//       (things may evolve as fal optimizes inference speed/capacity further)
function numStepsToRun() {
  let secondsSinceInteraction = (new Date() - lastLowQualityTime) / 1000;
  // start at 2 steps, max 12 steps (reached after 24 seconds)
  return 2 + Math.min(10, Math.floor(secondsSinceInteraction / 2));
}

// If you make too many requests to fal.ai currently, it will:
//  (1) increase input lag due to the socket's requests getting queued up
//        (bc inference is round-robin processed fal-side)
//  (2) increase the chance of LOWER framerate/request timeouts
//        (bc "remove old requests to keep it realtime" logic fal-side)
//    so you want your requests to be carefully tuned to the current fastest available speed
//      (maybe this could be detected automatically in the future or provided by fal as a hint)
function getTimeoutForRequests() {
  // UNUSED - use if you want to throttle based on interaction, or as a rule of thumb for parallel request rate
  // wait 100ms after 2-step, wait 1700ms after 12-step
  //    the 70ms additional per extra step is probably too conservatively high, haven't dialed that in
  return 100 + ((numStepsToRun() - 2) * 70);
}