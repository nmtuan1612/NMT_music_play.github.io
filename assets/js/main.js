
/** Tasks list
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / pause /seek
 * 4. CD rotation
 * 5. Next / Previous
 * 6. Random
 * 7. Next / repeat when finished
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when clicked
 */

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'Nmt_Player'

const player = $('.player')
const dashBoard = $('.dashboard')
const songName = $('header h3')
const cdThumb = $('.cd-thumb')
const currentTime = $('.song-current-time')
const timeLeft = $('.song-time-left')
const audio = $('#audio')
const mediaBtns = $$('.media-btn')
const playBtn = $('.btn-toggle-play')
const previousBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const volume = $('.volume')
const volumeIcon = $('#volume-icon')
const songProgress = $('#progress')
const progressSlider = $('.time-line')
const playList = $('.playlist')

const app = {
    currentIndex : 0,
    isPlaying : false,
    isRandom : false,
    isRepeat : false,
    currentVolume : 100,
    maxVolume : 100,

    config : JSON.parse(localStorage.getItem('PLAYER_STORAGE_KEY')) || {}, 

    // Songs data
    songs: [
        {
          name: "Điền vào ô trống (250)",
          singer: "Cahoihoang",
          path: '../assets/music/DienVaoOTrong250-CaHoiHoang.mp3',
          image: '../img/Dienvaootrong250.jpeg' 
        },
        {
          name: "Đông kiếm em",
          singer: "Vu.",
          path: '../assets/music/DongKiemEm-ThaiVu.mp3',
          image: '../assets/img/Dongkiemem.jpeg'
        },
        {
          name: "Nevada",
          singer: "Vicetone​ feat. Cozi Zuehlsdorff​",
          path: "../assets/music/Nevada.mp3",
          image: "../assets/img/Nevada.jpeg"
        },
        {
          name: "Ngày khác lạ",
          singer: "Den x DJ GiangPham x TripleD",
          path: "../assets/music/NgayKhacLa-DenDJGiangPhamTripleD.mp3",
          image: "../assets/img/Ngaykhacla.jpeg"
        },
        {
          name: "Ngày nào",
          singer: "CaHoiHoang x Datmaniac",
          path: "../assets/music/NgayNao-CaHoiHoangDatmaniac.mp3",
          image: "../assets/img/maxresdefault.jpeg"
        },
        {
          name: "Older",
          singer: "Sasha Sloan",
          path: "../assets/music/Older-SashaSloan.mp3",
          image: "../assets/img/Older.jpeg"
        },
        {
          name: "Sugar",
          singer: "Maroon5",
          path: "../assets/music/Sugar-Maroon5.mp3",
          image: "../assets/img/Sugar.jpeg"
        },
        {
          name: "Why not me",
          singer: "Enrique Iglesias",
          path: "../assets/music/WhyNotMe-EnriqueIglesias.mp3",
          image: "../assets/img/whynotme.jpeg"
        },
        {
          name: "Summer time",
          singer: "K391",
          path: "../assets/music/Summertime.mp3",
          image: "../assets/img/summertime.jpeg"
        },
        {
          name: "Never be alone",
          singer: "Nightcore ",
          path: "../assets/music/NeverBeAlone-Nightcore.mp3",
          image: "../assets/img/neverbealone.jpeg"
        }
    ],

    // Config setting
    setConfig: function(key, value) {
      this.config[key] = value;
      localStorage.setItem('PLAYER_STORAGE_KEY', JSON.stringify(this.config))
    },

    // Render songs
    render: function() {
        html = this.songs.map((song, index) => {
            return `
                <div class="song ${this.currentIndex === index ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url(${song.image})"></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playList.innerHTML = html.join("")
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
        }})
    },

    // Event handlers
    handleEvents: function() {
        const _this = this
        const cd = $('.cd')
        const cdWidth = cd.offsetWidth

        // Xu ly Cd rotation
        const cdThumbAnimation = cdThumb.animate([
          // keyframe
          { transform: 'rotate(360deg)' }
        ], {
          duration: 10000,
          iterations: Infinity
        })
        cdThumbAnimation.pause()

        // Xu ly zoom in/out Cd khi Scroll top
        document.onscroll = function() {
            const scrollTop =  window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xu ly choi nhac (play / pause)
        playBtn.onclick = function() {
            if(_this.isPlaying) {
              audio.pause()
            } else {
              audio.play()
            }
        }

        // Khi audio pause
        audio.onpause = function() {
          _this.isPlaying = false
          player.classList.remove('playing')
          cdThumbAnimation.pause()
        }

        // Khi audio play
        audio.onplay = function() {
          _this.isPlaying = true
          player.classList.add('playing')
          cdThumbAnimation.play()
        }

        audio.ontimeupdate = function() {
          if (audio.duration) {
            timeLeft.innerText = '- ' + _this.convertTime(audio.duration - audio.currentTime)
            currentTime.innerText = _this.convertTime(audio.currentTime)

            const currentPercent = Math.floor(audio.currentTime / audio.duration * 100)
            songProgress.value = currentPercent
            // progressSlider.style.width = currentPercent + '%' 
          }
        }

        // Khi tua audio
        songProgress.oninput = function() {
          const seekTime =  songProgress.value * audio.duration / 100
          audio.currentTime = seekTime
          currentTime.innerText = _this.convertTime(seekTime)
        }

        //  Khi click next song
        nextBtn.onclick = function() {
          if(_this.isRandom) {
            _this.randomSong()
          } else {
            _this.nextSong()
          }
          audio.play()
          _this.render()   // active song
          _this.scrollToActiveSong()
        }

        //  Khi click previous song
        previousBtn.onclick = function() {
          if(_this.isRandom) {
            _this.randomSong()
          } else {
            _this.previousSong()
          }
          audio.play()
          _this.render()
          _this.scrollToActiveSong()
        }

        // Xu ly bat/tat random song
        randomBtn.onclick = function() {
          _this.isRandom = !_this.isRandom
          _this.setConfig('isRandom', _this.isRandom)
          randomBtn.classList.toggle('active', this.isRandom)    // add active class if _this.isRandom is true
        }

        // Xu ly khi audio finished
        repeatBtn.onclick = function() {
          _this.isRepeat = !_this.isRepeat
          _this.setConfig('isRepeat', _this.isRepeat)
          repeatBtn.classList.toggle('active', this.isRepeat) // add active class if _this.isRepeat is true
        }

        audio.onended = function() {
          if(_this.isRepeat) {
            audio.play()
          } else {
            nextBtn.click()
          }
        }

        // Xu ly khi click vao bai hat
        playList.onclick = function(e) {
          songClicked = e.target.closest('.song:not(.active)')
          if (songClicked) {
            _this.currentIndex = Number(songClicked.dataset.index)  // str to Number
            _this.loadCurrentSong()
            _this.render()
            console.log(songClicked)
            audio.play()
          }
        },

        //  Xu ly dieu chinh volume
        volume.oninput = function() {
          _this.currentVolume = Number(volume.value)
          // console.log(volume.value)
          if (_this.currentVolume > 70) {
            volumeIcon.className = "fas fa-volume-up"
          } else if (_this.currentVolume <= 70 && _this.currentVolume > 0) {
            volumeIcon.className = "fas fa-volume-down"
          } else {
            volumeIcon.className = "fas fa-volume-mute"
          }
          _this.changeVolume(_this.currentVolume)
        }
    },

    // Convert time
    convertTime: function(time) {
      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time) - minutes * 60
      return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`
    },

    // Song loading
    loadCurrentSong: function() {
      songName.textContent = this.currentSong.name
      cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
      audio.src = this.currentSong.path
      $('body').style.backgroundImage = `url('${this.currentSong.image}')`
      this.changeVolume(this.currentVolume)
    },

    // Config loading
    loadConfig: function() {
      this.isRandom = this.config.isRandom
      this.isRepeat = this.config.isRepeat
      randomBtn.classList.toggle('active', this.isRandom)    // add active class if _this.isRandom is true
      repeatBtn.classList.toggle('active', this.isRepeat) // add active class if _this.isRepeat is true
    },

    // Xu ly next audio
    nextSong: function() {
      this.currentIndex++
      if (this.currentIndex >= this.songs.length) {
        this.currentIndex = 0
      }
      this.loadCurrentSong()
    },

    // Xu ly previous audio
    previousSong: function() {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.songs.length - 1
      }
      this.loadCurrentSong()
    },

    // Xu ly random song
    randomSong: function() {
      let randomIndex 
      do {
        randomIndex = Math.floor(Math.random() * this.songs.length)
      } while (randomIndex === this.currentIndex)
      this.currentIndex = randomIndex
      this.loadCurrentSong()
      console.log(this.currentIndex)
    },

    changeVolume: function(newVolume) {
      audio.volume = newVolume / 100
    },

    scrollToActiveSong: function() {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    },

    // App start
    start: function() {
        //  Gan cau hinh tu config vao ung dung
        this.loadConfig()
        //  Dinh nghia cac thuoc tinh cho obj
        this.defineProperties()

        // Lang nghe / cu ly cac su kien (DOM events)
        this.handleEvents()

        // Load bai hat dau tien vao UI
        this.loadCurrentSong()
        this.render()
    }
}

app.start()
