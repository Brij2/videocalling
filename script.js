const startButton = document.getElementById('startButton');
const hangupButton = document.getElementById('hangupButton');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const fallingText = document.getElementById('fallingText');
const callerIdInput = document.getElementById('callerId');
const calleeIdInput = document.getElementById('calleeId');

let localStream;
let remoteStream;
let pc1;
let pc2;
let localId;
let remoteId;

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
      sendMessage(remoteId, JSON.stringify({ type: 'candidate', candidate: event.candidate }));
    }
  };

  pc2.onicecandidate = (event) => {
    if (event.candidate) {
      sendMessage(localId, JSON.stringify({ type: 'candidate', candidate: event.candidate }));
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
  sendMessage(remoteId, JSON.stringify({ type: 'offer', offer: offer }));
};

const hangUp = () => {
  pc1.close();
  pc2.close();
  localStream.getTracks().forEach((track) => track.stop());
  localVideo.srcObject = null;
  remoteVideo.srcObject = null;
};

// Assume you have a function sendMessage to send messages to the signaling server.
// Modify this function according to your actual signaling server implementation.
const sendMessage = (targetId, message) => {
  // Replace the following code with your actual implementation
  // that sends the message to the targetId using your signaling server.
  console.log(`Sending message to ${targetId}: ${message}`);
};

startButton.addEventListener('click', () => {
  localId = callerIdInput.value.trim();
  remoteId = calleeIdInput.value.trim();
  if (localId && remoteId) {
    startCall();
  } else {
    alert('Please enter both your ID and your friend\'s ID.');
  }
});

hangupButton.addEventListener('click', hangUp);
