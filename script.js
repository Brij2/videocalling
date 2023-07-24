const startButton = document.getElementById('startButton');
const hangupButton = document.getElementById('hangupButton');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const fallingText = document.getElementById('fallingText');

let localStream;
let remoteStream;
let pc1;
let pc2;

const startCall = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
  } catch (err) {
    console.error('Error accessing media devices: ', err);
  }

  const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  pc1 = new RTCPeerConnection(configuration);
  pc2 = new RTCPeerConnection(configuration);

  pc1.onicecandidate = (event) => {
    if (event.candidate) {
      pc2.addIceCandidate(event.candidate);
    }
  };

  pc2.onicecandidate = (event) => {
    if (event.candidate) {
      pc1.addIceCandidate(event.candidate);
    }
  };

  pc2.ontrack = (event) => {
    if (!remoteVideo.srcObject) {
      remoteVideo.srcObject = event.streams[0];
      remoteStream = event.streams[0];
    }
  };

  localStream.getTracks().forEach((track) => pc1.addTrack(track, localStream));

  const offer = await pc1.createOffer();
  await pc1.setLocalDescription(offer);
  await pc2.setRemoteDescription(offer);

  const answer = await pc2.createAnswer();
  await pc2.setLocalDescription(answer);
  await pc1.setRemoteDescription(answer);

  // Start the falling text animation after setting up the call.
//   animateFallingText();
};

const hangUp = () => {
  pc1.close();
  pc2.close();
  localStream.getTracks().forEach((track) => track.stop());
  localVideo.srcObject = null;
  remoteVideo.srcObject = null;
};

const animateFallingText = () => {
  const characters = ['0', '1'];
  const animationDuration = 1;
  const characterCount = 50;
  const charactersPerRow = 100;

  fallingText.innerHTML = '';

  for (let i = 0; i < characterCount; i++) {
    setTimeout(() => {
      fallingText.innerHTML += characters[Math.floor(Math.random() * characters.length)];
      if (i % charactersPerRow === 0) fallingText.innerHTML += '<br />';
    }, i * animationDuration * 10);
  }

  setTimeout(() => {
    fallingText.innerHTML = '';
    animateFallingText();
  }, characterCount * animationDuration * 10);
};

startButton.addEventListener('click', startCall);
hangupButton.addEventListener('click', hangUp);
