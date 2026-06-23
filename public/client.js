(function () {
  // Manual copy/paste signaling implementation so pages can be opened via file://
  const role = location.pathname.includes('sender') ? 'sender' : 'viewer';

  const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  let pc = null;

  function by(id) { return document.getElementById(id); }

  function renderQRCode(targetId, text) {
    const wrapper = by(targetId);
    if (!wrapper) return;
    wrapper.innerHTML = '';
    if (!text) return;
    try {
      new QRCode(wrapper, {
        text,
        width: 240,
        height: 240,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.L,
      });
    } catch (e) {
      wrapper.textContent = 'QR生成に失敗しました: ' + e.message;
    }
  }

  function updateLocalOutput(text) {
    const outEl = by('localSDP');
    if (outEl) outEl.value = text;
    renderQRCode('localQR', text);
  }

  function createPeer() {
    pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (e) => {
      if (!e.candidate) {
        if (pc.localDescription) updateLocalOutput(JSON.stringify(pc.localDescription));
      }
    };

    if (role === 'viewer') {
      pc.ontrack = (e) => {
        const video = by('remoteVideo');
        if (video && video.srcObject !== e.streams[0]) video.srcObject = e.streams[0];
      };
    }

    return pc;
  }

  async function startSender() {
    try {
      createPeer();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      const localVideo = by('localVideo');
      if (localVideo) localVideo.srcObject = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      // wait for ICE gathering to complete; onicecandidate handles output
    } catch (e) {
      console.error('startSender error', e);
      alert('カメラにアクセスできません。file:// では getUserMedia が動かないブラウザがあります。');
    }
  }

  async function createAnswerFromOffer() {
    try {
      createPeer();
      const offerText = by('remoteSDP').value.trim();
      if (!offerText) return alert('Offer SDP を貼り付けてください');
      const offer = JSON.parse(offerText);
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      // local SDP will be populated when ICE gathering completes
    } catch (e) {
      console.error('createAnswer error', e);
      alert('Answer 生成に失敗しました: ' + e.message);
    }
  }

  async function setRemoteDescFromText() {
    try {
      const text = by('remoteSDP').value.trim();
      if (!text) return alert('Remote SDP を貼り付けてください');
      const obj = JSON.parse(text);
      await pc.setRemoteDescription(obj);
    } catch (e) {
      console.error('setRemoteDesc error', e);
      alert('Remote SDP 設定に失敗しました: ' + e.message);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (role === 'sender') {
      const startBtn = by('startBtn');
      const setRemoteBtn = by('setRemoteBtn');
      if (startBtn) startBtn.addEventListener('click', startSender);
      if (setRemoteBtn) setRemoteBtn.addEventListener('click', setRemoteDescFromText);
    } else {
      const answerBtn = by('answerBtn');
      if (answerBtn) answerBtn.addEventListener('click', createAnswerFromOffer);
    }
  });
})();
