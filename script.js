/* ============================================================
   预约阿布 — script.js
   ============================================================ */

;(() => {
  'use strict'

  /* --------------------------------------------------
     0. EmailJS 初始化
     -------------------------------------------------- */
  emailjs.init('REj-LmwliWVF6NKpm')

  /* --------------------------------------------------
     1. 粒子背景
     -------------------------------------------------- */
  const canvas = document.getElementById('particleCanvas')
  const ctx = canvas.getContext('2d')
  let particles = []
  let animId
  let mouseX = -1000, mouseY = -1000

  function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = document.documentElement.scrollHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  class Particle {
    constructor() {
      this.reset()
    }
    reset() {
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height
      this.size = Math.random() * 2 + 0.5
      this.speedX = (Math.random() - 0.5) * 0.6
      this.speedY = (Math.random() - 0.5) * 0.6
      this.opacity = Math.random() * 0.4 + 0.1
    }
    update() {
      this.x += this.speedX
      this.y += this.speedY
      const dx = mouseX - this.x
      const dy = mouseY - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 150) {
        const force = (150 - dist) / 150
        this.x -= dx * force * 0.02
        this.y -= dy * force * 0.02
      }
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset()
      }
    }
    draw() {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(139, 92, 246, ${this.opacity})`
      ctx.fill()
    }
  }

  const particleCount = Math.min(80, Math.floor(window.innerWidth * 80 / 1920))

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle())
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.08 * (1 - dist / 150)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of particles) {
      p.update()
      p.draw()
    }
    drawLines()
    animId = requestAnimationFrame(animateParticles)
  }

  animateParticles()

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY + window.scrollY
  })

  /* 滚动时重绘 canvas 尺寸 */
  window.addEventListener('scroll', () => {
    const oldH = canvas.height
    const newH = document.documentElement.scrollHeight
    if (Math.abs(newH - oldH) > 50) {
      canvas.height = newH
    }
  })

  /* --------------------------------------------------
     2. 导航栏滚动效果 + 汉堡菜单
     -------------------------------------------------- */
  const navbar = document.getElementById('navbar')
  const hamburger = document.getElementById('hamburger')
  const navMenu = document.getElementById('navMenu')

  let lastScroll = 0
  window.addEventListener('scroll', () => {
    const curr = window.scrollY
    if (curr > 80) {
      navbar.classList.add('scrolled')
    } else {
      navbar.classList.remove('scrolled')
    }
    /* 下滚隐藏、上滚显示 */
    if (curr > 150 && curr > lastScroll) {
      navbar.classList.add('hidden')
    } else {
      navbar.classList.remove('hidden')
    }
    lastScroll = curr
  })

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active')
    navMenu.classList.toggle('active')
  })

  /* 点击导航链接后关闭菜单 */
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active')
      navMenu.classList.remove('active')
    })
  })

  /* --------------------------------------------------
     3. 滚动入场动画 (IntersectionObserver)
     -------------------------------------------------- */
  const animateElements = document.querySelectorAll(
    '.service-card, .pricing-card, .about-wrapper, .review-card, .info-card, .section-header'
  )

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  )

  animateElements.forEach((el) => {
    el.classList.add('animate-on-scroll')
    observer.observe(el)
  })

  /* --------------------------------------------------
     4. 数字滚动动画
     -------------------------------------------------- */
  let statsAnimated = false

  function animateStats() {
    if (statsAnimated) return
    const stats = document.querySelectorAll('.stat strong[data-count]')
    if (stats.length === 0) return
    statsAnimated = true
    stats.forEach((el) => {
      const target = parseInt(el.getAttribute('data-count'), 10)
      const duration = 2000
      const start = performance.now()
      function step(now) {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const current = Math.floor(eased * target)
        el.textContent = current.toLocaleString()
        if (progress < 1) {
          requestAnimationFrame(step)
        } else {
          el.textContent = target.toLocaleString()
        }
      }
      requestAnimationFrame(step)
    })
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateStats()
          statsObserver.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.5 }
  )

  const aboutSection = document.querySelector('.about-section')
  if (aboutSection) statsObserver.observe(aboutSection)

  /* --------------------------------------------------
     5. 评价轮播
     -------------------------------------------------- */
  const track = document.getElementById('carouselTrack')
  const prevBtn = document.getElementById('prevBtn')
  const nextBtn = document.getElementById('nextBtn')
  const dotsContainer = document.getElementById('carouselDots')
  const cards = track ? track.querySelectorAll('.review-card') : []
  let currentIndex = 0
  let autoPlayId = null
  const AUTO_INTERVAL = 4000

  if (cards.length > 0) {
    const totalSlides = cards.length

    /* 创建 dots */
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button')
      dot.classList.add('dot')
      dot.setAttribute('aria-label', `第 ${i + 1} 条评价`)
      dot.addEventListener('click', () => goToSlide(i))
      dotsContainer.appendChild(dot)
    }

    function goToSlide(index) {
      currentIndex = index
      const offset = -currentIndex * 100
      track.style.transform = `translateX(${offset}%)`
      document.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentIndex)
      })
    }

    function nextSlide() {
      goToSlide((currentIndex + 1) % totalSlides)
    }

    function prevSlide() {
      goToSlide((currentIndex - 1 + totalSlides) % totalSlides)
    }

    function startAutoPlay() {
      stopAutoPlay()
      autoPlayId = setInterval(nextSlide, AUTO_INTERVAL)
    }

    function stopAutoPlay() {
      if (autoPlayId) {
        clearInterval(autoPlayId)
        autoPlayId = null
      }
    }

    prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay() })
    nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay() })

    /* 触摸/滑动支持 */
    let touchStartX = 0
    let touchEndX = 0
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX
      stopAutoPlay()
    }, { passive: true })
    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX
      const diff = touchStartX - touchEndX
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide()
        else prevSlide()
      }
      startAutoPlay()
    }, { passive: true })

    goToSlide(0)
    startAutoPlay()

    /* 鼠标悬停暂停自动播放 */
    track.addEventListener('mouseenter', stopAutoPlay)
    track.addEventListener('mouseleave', startAutoPlay)
  }

  /* --------------------------------------------------
     6. 预约表单
     -------------------------------------------------- */
  const form = document.getElementById('bookingForm')
  const successModal = document.getElementById('successModal')
  const modalClose = document.getElementById('modalClose')

  /* 表单验证 */
  function showError(input, msg) {
    const group = input.closest('.form-group')
    const errEl = group.querySelector('.error-msg')
    input.classList.add('invalid')
    if (errEl) errEl.textContent = msg
  }

  function clearError(input) {
    const group = input.closest('.form-group')
    const errEl = group.querySelector('.error-msg')
    input.classList.remove('invalid')
    if (errEl) errEl.textContent = ''
  }

  function validateField(input) {
    clearError(input)
    if (input.hasAttribute('required') && !input.value.trim()) {
      showError(input, '此项不能为空')
      return false
    }
    if (input.type === 'date' && input.value) {
      const selected = new Date(input.value + 'T00:00:00')
      if (selected < new Date(today.toDateString())) {
        showError(input, '日期不能早于今天')
        return false
      }
    }
    return true
  }

  /* 实时验证 */
  form.querySelectorAll('input, select, textarea').forEach((el) => {
    el.addEventListener('blur', () => validateField(el))
    el.addEventListener('input', () => {
      if (el.classList.contains('invalid')) validateField(el)
    })
    el.addEventListener('change', () => {
      if (el.classList.contains('invalid')) validateField(el)
    })
  })

  /* ---------- 提交成功/失败统一处理 ---------- */
  function showSuccess(msg) {
    const modalMsg = successModal.querySelector('p')
    if (msg && modalMsg) {
      modalMsg.innerHTML = msg.replace(/\n/g, '<br />')
    }

    successModal.classList.add('active')
    document.body.style.overflow = 'hidden'

    form.reset()
    form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'))
    form.querySelectorAll('.error-msg').forEach((el) => (el.textContent = ''))
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const fields = ['nickname', 'contact', 'service']
    let valid = true

    fields.forEach((id) => {
      const el = document.getElementById(id)
      if (!validateField(el)) valid = false
    })

    if (!valid) {
      const firstInvalid = form.querySelector('.invalid')
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
        firstInvalid.focus()
      }
      return
    }

    /* 保存到 localStorage */
    const record = {
      id: Date.now(),
      nickname: document.getElementById('nickname').value.trim(),
      contact: document.getElementById('contact').value.trim(),
      service: document.getElementById('service').value,
      message: document.getElementById('message').value.trim(),
      createdAt: new Date().toISOString(),
    }

    const records = JSON.parse(localStorage.getItem('abu_bookings') || '[]')
    records.push(record)
    localStorage.setItem('abu_bookings', JSON.stringify(records))

    /* 禁用按钮防止重复提交 */
    const btn = form.querySelector('button[type="submit"]')
    btn.disabled = true
    btn.textContent = '提交中…'

    /* ===== EmailJS 发信 ===== */
    const templateParams = {
      nickname: record.nickname,
      contact: record.contact,
      game: record.service,
      message: record.message || '（无留言）',
      name: record.nickname,
    }

    emailjs
      .send('service_rmcopxq', 'template_qwhroik', templateParams)
      .then(() => {
        showSuccess('预约成功！邮件已发送 ✅')
        btn.disabled = false
        btn.textContent = '提交预约'
      })
      .catch((err) => {
        console.warn('邮件发送失败，但数据已本地保存', err)
        showSuccess('预约已提交 ✅（邮件发送暂未成功，阿布仍能看到记录）')
        btn.disabled = false
        btn.textContent = '提交预约'
      })
  })

  /* 关闭弹窗 */
  function closeModal() {
    successModal.classList.remove('active')
    document.body.style.overflow = ''
  }

  modalClose.addEventListener('click', closeModal)
  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) closeModal()
  })

  /* ESC 关闭 */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && successModal.classList.contains('active')) closeModal()
  })

  /* --------------------------------------------------
     7. 平滑滚动 (兼容原生)
     -------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href')
      if (href === '#') return
      const target = document.querySelector(href)
      if (target) {
        e.preventDefault()
        const offset = navbar.offsetHeight + 16
        const top = target.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: 'smooth' })
      }
    })
  })

  /* --------------------------------------------------
     8. 视差效果（部分 section 背景微动）
     -------------------------------------------------- */
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY
    document.querySelectorAll('.hero, .about-section, .reviews-section').forEach((el) => {
      const rate = 0.03
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const y = (rect.top + rect.height / 2 - window.innerHeight / 2) * rate
        el.style.setProperty('--parallax-y', `${y}px`)
      }
    })
  })

})()
