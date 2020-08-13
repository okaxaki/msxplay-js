import { KSS } from "libkss-js";
import MGSC from "mgsc-js";
import MSXPlay from "./msxplay";
import mgs2mml, { getJumpMarkerCount } from "mgsrc-js";
import Encoding from "encoding-japanese";

function zeroPadding(num) {
  return ("00" + num).slice(-2);
}

function timeToString(timeInMs) {
  const timeInSec = Math.floor(timeInMs / 1000);
  return Math.floor(timeInSec / 60) + ":" + zeroPadding(timeInSec % 60);
}

function parseTime(str) {
  if (!str) return null;

  let m = str.match(/^(.*)ms$/);
  if (m) {
    return parseFloat(m[1]);
  }
  m = str.match(/^(.*)s$/);
  if (m) {
    return parseFloat(m[1]) * 1000;
  }

  return null;
}

class MSXPlayUI {
  constructor() {
    this.msxplay = new MSXPlay();
    this.playerElements = [];
    this._audioTag = null;
    setInterval(this.updateDisplay.bind(this), 100);
  }

  audio_encode(type, data, song, callback, opts) {
    this.msxplay.audio_encode(type, data, song, callback, opts);
  }

  decode_text(data) {
    const encode = Encoding.detect(data);
    return Encoding.convert(data, { to: "UNICODE", from: encode, type: "string" });
  }

  compile(mml) {
    return MGSC.compile(mml);
  }

  decompile(mgs) {
    return mgs2mml(mgs);
  }

  checkMGSJumpMarker(mgs) {
    return getJumpMarkerCount(mgs);
  }

  async install(rootElement) {
    await MGSC.initialize();
    await MSXPlay.initialize();
    const players = rootElement.querySelectorAll(".msxplay");
    for (let i = 0; i < players.length; i++) {
      this.attach(players[i]);
    }
  }

  async attach(playerElement) {
    await this.initPlayer(playerElement);
    this.playerElements.push(playerElement);
    playerElement.addEventListener("click", this.onClickPlayer.bind(this), true);
  }

  detach(playerElement) {
    const i = this.playerElements.indexOf(playerElement);
    if (0 <= i) {
      this.playerElements.splice(i, 1);
    }
  }

  createPlayerFromUrl(url) {
    const playerElement = document.createElement("div");
    playerElement.classList.add("msxplay");
    playerElement.dataset.gain = "1.0";
    playerElement.dataset.url = url;
    return playerElement;
  }

  createPlayer(data, url) {
    const m = (url || "").match(/([^/]+)$/);
    const name = m ? m[1] : null;
    const kss = KSS.createUniqueInstance(new Uint8Array(data), name);
    const playerElement = document.createElement("div");
    playerElement.classList.add("msxplay");
    playerElement.dataset.gain = "1.0";
    playerElement.dataset.url = url;
    playerElement.dataset.hash = kss.hash;
    this.attach(playerElement);
    return playerElement;
  }

  onClickPlayer(event) {
    let playerElement = event.target;
    while (playerElement) {
      if (playerElement.classList.contains("msxplay")) break;
      playerElement = playerElement.parentNode;
    }
    if (!playerElement) {
      return;
    }
    if (event.target == playerElement.querySelector(".leftbox")) {
      if (playerElement == this.currentPlayerElement) {
        if (this.msxplay.getState() == "finished") {
          this.play(playerElement);
        } else if (this.msxplay.isPaused()) {
          this.msxplay.resume();
        } else {
          this.msxplay.pause();
        }
      } else {
        this.play(playerElement);
      }
    } else if (event.target.classList.contains("track")) {
      if (playerElement == this.currentPlayerElement) {
        const pos = Math.floor((this.msxplay.getTotalTime() * event.offsetX) / event.target.offsetWidth);
        this.msxplay.seekTo(pos);
      }
    } else if (event.target.classList.contains("next")) {
      const song = (parseInt(playerElement.dataset.song) + (event.shiftKey ? 10 : 1)) % 256;
      playerElement.dataset.song = song;
      playerElement.querySelector(".number").textContent = zeroPadding(song.toString(16));
      playerElement.dataset.duration = null;
      if (playerElement == this.currentPlayerElement) {
        this.play(playerElement);
      }
    } else if (event.target.classList.contains("prev")) {
      const song = (parseInt(playerElement.dataset.song) + (event.shiftKey ? 246 : 255)) % 256;
      playerElement.dataset.song = song;
      playerElement.querySelector(".number").textContent = zeroPadding(song.toString(16));
      playerElement.dataset.duration = null;
      if (playerElement == this.currentPlayerElement) {
        this.play(playerElement);
      }
    }
  }

  setDataToPlayer(playerElement, data, name) {
    const kss = KSS.createUniqueInstance(data, name);
    setKSSToPlayerElement(playerElement, kss, name);
  }

  async initPlayer(playerElement) {
    playerElement.innerHTML = "";
    playerElement.insertAdjacentHTML(
      "afterbegin",
      '<div class="leftbox"></div>' +
      '<div class="rightbox">' +
      '    <div class="title"></div>' +
      '    <div class="spinner">' +
      '       <div class="button next"></div>' +
      '       <div class="number"></div>' +
      '       <div class="button prev"></div>' +
      "    </div>" +
      '    <div class="slider">' +
      '	    <div class="playtime">0:00</div>' +
      '       <div class="duration">?:??</div>' +
      '		<div class="track">' +
      '			<div class="buffered"></div>' +
      ' 		    <div class="progress"></div>' +
      "		</div>" +
      "	 </div>" +
      "</div>" +
      '<div class="footer"></div>'
    );

    if (playerElement.dataset.url) {
      playerElement.querySelector(".title").textContent = "Loading...";
      await this.loadKSS(playerElement);
    }
    if (playerElement.dataset.footnote) {
      playerElement.querySelector(".footer").textContent = playerElement.dataset.footnote;
    }
    if (!playerElement.dataset.song) {
      playerElement.dataset.song = 0;
    }
    playerElement.querySelector(".number").textContent = zeroPadding(parseInt(playerElement.dataset.song).toString(16));
  }

  async loadKSS(playerElement) {
    const hash = playerElement.dataset.hash;
    if (hash) {
      const kss = KSS.hashMap[hash];
      setKSSToPlayerElement(playerElement, kss, playerElement.dataset.url);
    } else {
      const url = playerElement.dataset.url;
      const kss = await KSS.loadFromUrl(url);
      setKSSToPlayerElement(playerElement, kss, url);
    }
  }

  stop() {
    this.msxplay.stop();
    if (this.currentPlayerElement) {
      this.currentPlayerElement.classList.remove("active");
      this.currentPlayerElement = null;
    }
    for (let i = 0; i < this.playerElements.length; i++) {
      const playerElement = this.playerElements[i];
      setPlayerState(playerElement, "standby");
      playerElement.querySelector(".buffered").style.width = 0;
      playerElement.querySelector(".progress").style.width = 0;
      playerElement.querySelector(".playtime").textContent = "0:00";
      const duration = parseTime(playerElement.dataset.duration);
      if (duration) {
        playerElement.querySelector(".duration").textContent = timeToString(duration);
      } else {
        playerElement.querySelector(".duration").textContent = "?:??";
      }
    }
  }

  // unmute for mobile browsers
  // https://stackoverflow.com/questions/21122418/ios-webaudio-only-works-on-headphones/46839941#46839941
  unmute() {
    if (this._audioTag) {
      // dispose audio tag.
      this._audioTag.removeAttribute('src');
    }
    const silenceDataURL = "data:audio/mp3;base64,//MkxAAHiAICWABElBeKPL/RANb2w+yiT1g/gTok//lP/W/l3h8QO/OCdCqCW2Cw//MkxAQHkAIWUAhEmAQXWUOFW2dxPu//9mr60ElY5sseQ+xxesmHKtZr7bsqqX2L//MkxAgFwAYiQAhEAC2hq22d3///9FTV6tA36JdgBJoOGgc+7qvqej5Zu7/7uI9l//MkxBQHAAYi8AhEAO193vt9KGOq+6qcT7hhfN5FTInmwk8RkqKImTM55pRQHQSq//MkxBsGkgoIAABHhTACIJLf99nVI///yuW1uBqWfEu7CgNPWGpUadBmZ////4sL//MkxCMHMAH9iABEmAsKioqKigsLCwtVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVV//MkxCkECAUYCAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
    const tag = document.createElement('audio');
    tag.controls = false;
    tag.preload = "auto";
    tag.loop = false;
    tag.src = silenceDataURL;
    tag.play();
    this._audioTag = tag;
  }

  play(playerElement) {
    this.stop();
    const hash = playerElement.dataset.hash;
    const song = parseInt(playerElement.dataset.song);
    const duration = parseTime(playerElement.dataset.duration);
    const fade = parseFloat(playerElement.dataset.fade);
    const gain = parseFloat(playerElement.dataset.gain);
    const debug_mgs = parseInt(playerElement.dataset.debug_mgs);
    const cpu = parseInt(playerElement.dataset.cpu);
    const kss = KSS.hashMap[hash];
    if (kss) {
      this.unmute();
      this.msxplay.setData(kss, song, {
        duration,
        fade,
        gain,
        debug_mgs,
        cpu,
      });
      this.msxplay.play();
      this.currentPlayerElement = playerElement;
      playerElement.classList.add("active");
      if (kss.hasMultiSongs) {
        playerElement.classList.add("multi-songs");
      } else {
        playerElement.classList.remove("multi-songs");
      }
    }
  }

  updateDisplay() {
    if (this.currentPlayerElement) {
      this.updatePlayerStatus(this.currentPlayerElement);
    }
  }

  updatePlayerStatus(playerElement) {
    const played = this.msxplay.getPlayedTime();
    const buffered = this.msxplay.getBufferedTime();
    const total = this.msxplay.getTotalTime();
    const renderSpeed = this.msxplay.getRenderSpeed().toFixed(1);
    playerElement.querySelector(".playtime").textContent = timeToString(played);
    if (buffered < total) {
      playerElement.querySelector(".playtime").textContent += " buffering... (x" + renderSpeed + ") ";
    } else {
      playerElement.dataset.duration = total + "ms";
    }
    playerElement.querySelector(".duration").textContent = timeToString(total);
    playerElement.querySelector(".progress").style.width = Math.round((100 * played) / total) + "%";
    playerElement.querySelector(".buffered").style.width = Math.round((100 * buffered) / total) + "%";
    setPlayerState(playerElement, this.msxplay.getState());
  }

  releaseKSS(kss) {
    if (typeof kss == "string") {
      kss = KSS.hashMap[kss];
    }
    if (kss instanceof KSS) {
      kss.release();
    }
  }
}

function setKSSToPlayerElement(playerElement, kss, url) {
  if (kss instanceof KSS) {
    let title = playerElement.dataset.title || kss.getTitle();
    if (/^[\u0000-\u0020]*$/.test(title)) {
      title = url.replace(/^.*[/\\]/, "");
    }
    playerElement.querySelector(".title").textContent = title;
    playerElement.dataset.hash = kss.hash;
  } else {
    // Error
    playerElement.querySelector(".title").textContent = kss.toString();
    playerElement.dataset.hash = null;
  }
}

function setPlayerState(playerElement, state) {
  playerElement.classList.remove("playing");
  playerElement.classList.remove("paused");
  playerElement.classList.remove("finished");
  playerElement.classList.remove("standby");
  playerElement.classList.add(state);
}

export default new MSXPlayUI();
