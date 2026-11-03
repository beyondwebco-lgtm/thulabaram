/**
 * THULABARAM (తులాభారం) - Real Estate Valuation Platform Logic
 * Reusable Components & Interactive Engine
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. HeroScaleVideo Reusable Component
  // ==========================================================================
  /**
   * HeroScaleVideo component
   * Configurable video source (MP4/WebM) with instant fallback to static visual
   */
  const HeroScaleVideo = {
    config: {
      containerId: 'hero-scale-video-root',
      videoMp4: 'weighing%20animation.mp4',
      videoWebm: '', // Configurable prop: Set WebM URL here
      placeholderImage: '',
      altText: 'తులాభారం - సాంప్రదాయ బంగారు త్రాసు మరియు భూమి విలువ దృశ్యం',
    },

    init(options = {}) {
      this.config = { ...this.config, ...options };
      const container = document.getElementById(this.config.containerId);
      if (!container) return;

      // Check if video is already properly rendered in DOM from HTML
      const existingVideo = container.querySelector('video');
      if (existingVideo) {
        // Video already present: just ensure playback without touching DOM
        existingVideo.muted = true;
        existingVideo.play().catch(e => console.log('Video autoplay:', e));
        return;
      }

      this.render(container);
    },

    setSource({ mp4 = '', webm = '' }) {
      this.config.videoMp4 = mp4;
      this.config.videoWebm = webm;
      const container = document.getElementById(this.config.containerId);
      if (container) {
        this.render(container);
      }
    },

    render(container) {
      container.innerHTML = '';

      const wrapper = document.createElement('div');
      wrapper.className = 'hero-scale-media-wrapper';

      // Floating Telugu badges matching the traditional theme
      const badgeLeft = document.createElement('div');
      badgeLeft.className = 'hero-scale-badge left';
      badgeLeft.innerHTML = `<span>🏡</span><span>నివాస స్థలాలు</span>`;

      const badgeRight = document.createElement('div');
      badgeRight.className = 'hero-scale-badge right';
      badgeRight.innerHTML = `<span>📍</span><span>వ్యవసాయ భూములు</span>`;

      wrapper.appendChild(badgeLeft);
      wrapper.appendChild(badgeRight);

      if (this.config.videoMp4 || this.config.videoWebm) {
        // Video mode: Seamless looping video
        const video = document.createElement('video');
        video.className = 'hero-scale-media-element';
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('loop', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        if (this.config.placeholderImage) { video.poster = this.config.placeholderImage; }

        if (this.config.videoWebm) {
          const sourceWebm = document.createElement('source');
          sourceWebm.src = this.config.videoWebm;
          sourceWebm.type = 'video/webm';
          video.appendChild(sourceWebm);
        }

        if (this.config.videoMp4) {
          const sourceMp4 = document.createElement('source');
          sourceMp4.src = this.config.videoMp4;
          sourceMp4.type = 'video/mp4';
          video.appendChild(sourceMp4);
        }

        wrapper.appendChild(video);
        setTimeout(() => {
          video.play().catch(e => console.log('Video autoplay:', e));
        }, 50);
      } else {
        // High-res placeholder image mode
        const img = document.createElement('img');
        img.className = 'hero-scale-media-element';
        img.src = this.config.placeholderImage;
        img.alt = this.config.altText;
        img.loading = 'eager';
        wrapper.appendChild(img);
      }

      container.appendChild(wrapper);
    }
  };

  // Expose globally for future video integration
  window.HeroScaleVideo = HeroScaleVideo;


  // ==========================================================================
  // 2. Market Valuation Engine & Search Component
  // ==========================================================================
  const ValuationEngine = {
    // Market baseline data for prominent Telangana & AP regions
    rates: {
      'shankarpally': {
        name: 'శంకర్పల్లి, హైదరాబాద్',
        agriculturePerAcre: 13000000, // 1.30 Cr
        residentialPerSqYd: 22000,
        commercialPerSqYd: 45000,
        farmlandPerAcre: 11000000
      },
      'gachibowli': {
        name: 'గచ్చిబౌలి, హైదరాబాద్',
        agriculturePerAcre: 85000000, // 8.5 Cr
        residentialPerSqYd: 120000,    // 1.2 Lakh
        commercialPerSqYd: 220000,
        farmlandPerAcre: 60000000
      },
      'shamirpet': {
        name: 'శామీర్పేట, హైదరాబాద్',
        agriculturePerAcre: 10000000, // 1.00 Cr
        residentialPerSqYd: 18000,
        commercialPerSqYd: 38000,
        farmlandPerAcre: 9000000
      },
      'patanacheru': {
        name: 'పటాన్‌చెరు, హైదరాబాద్',
        agriculturePerAcre: 16000000,
        residentialPerSqYd: 28000,
        commercialPerSqYd: 55000,
        farmlandPerAcre: 14000000
      },
      'kollur': {
        name: 'కొల్లూరు, హైదరాబాద్',
        agriculturePerAcre: 28000000,
        residentialPerSqYd: 45000,
        commercialPerSqYd: 90000,
        farmlandPerAcre: 22000000
      },
      'kokapet': {
        name: 'కోకాపేట, హైదరాబాద్',
        agriculturePerAcre: 95000000,
        residentialPerSqYd: 150000,
        commercialPerSqYd: 280000,
        farmlandPerAcre: 75000000
      },
      'vijayawada': {
        name: 'విజయవాడ, ఆంధ్రప్రదేశ్',
        agriculturePerAcre: 14000000,
        residentialPerSqYd: 32000,
        commercialPerSqYd: 65000,
        farmlandPerAcre: 12000000
      },
      'visakhapatnam': {
        name: 'విశాఖపట్నం, ఆంధ్రప్రదేశ్',
        agriculturePerAcre: 18000000,
        residentialPerSqYd: 40000,
        commercialPerSqYd: 80000,
        farmlandPerAcre: 15000000
      }
    },

    formatIndianCurrency(amount) {
      if (amount >= 10000000) {
        const cr = (amount / 10000000).toFixed(2);
        return `₹ ${cr} కోట్లు`;
      } else if (amount >= 100000) {
        const lk = (amount / 100000).toFixed(2);
        return `₹ ${lk} లక్షలు`;
      } else {
        return `₹ ${amount.toLocaleString('en-IN')}`;
      }
    },

    calculate(locationKey, landType, areaValue) {
      const data = this.rates[locationKey] || this.rates['shankarpally'];
      const area = parseFloat(areaValue) || 1;

      let unitRate = 0;
      let unitName = '';
      let total = 0;

      if (landType === 'residential') {
        unitRate = data.residentialPerSqYd;
        unitName = 'గజం';
        total = unitRate * area;
      } else if (landType === 'commercial') {
        unitRate = data.commercialPerSqYd;
        unitName = 'గజం';
        total = unitRate * area;
      } else if (landType === 'farmland') {
        unitRate = data.farmlandPerAcre;
        unitName = 'ఎకరం';
        total = unitRate * area;
      } else {
        // Default agricultural
        unitRate = data.agriculturePerAcre;
        unitName = 'ఎకరం';
        total = unitRate * area;
      }

      const govtRate = Math.round(total * 0.72);
      const trustScore = 96 + Math.floor(Math.random() * 3);

      return {
        locationName: data.name,
        totalFormatted: this.formatIndianCurrency(total),
        unitRateFormatted: `${this.formatIndianCurrency(unitRate)} / ${unitName}`,
        govtRateFormatted: this.formatIndianCurrency(govtRate),
        trustScore: `${trustScore}%`,
        landTypeTelugu: this.getLandTypeName(landType),
        areaValue,
        unitName
      };
    },

    getLandTypeName(type) {
      switch (type) {
        case 'residential': return 'రెసిడెన్షియల్ ప్లాట్ (స్థలం)';
        case 'commercial': return 'కమర్షియల్ భూమి';
        case 'farmland': return 'ఫామ్‌ల్యాండ్ / తోట భూమి';
        default: return 'వ్యవసాయ భూమి (పొలం)';
      }
    }
  };


  // ==========================================================================
  // 3. Featured Property Listings Data & Filtering
  // ==========================================================================
  const propertyData = [
    // --- అమ్మకానికి (For Sale) ---
    {
      id: 1,
      category: 'sale',
      image: 'assets/property-1.jpg',
      badge: 'అమ్మకానికి',
      title: 'పొలం - 2.5 ఎకరాలు',
      location: 'శంకర్పల్లి, హైదరాబాద్',
      price: '₹ 3.25 కోట్లు',
      unitPrice: '(₹ 1.30 కోట్లు / ఎకరం)',
      specs: {
        soil: 'నల్ల రేగడి భూమి',
        water: 'రెండు బోరుబావులు, నిరంతర నీటి సదుపాయం',
        road: '30 అడుగుల తారు రోడ్డు ఫేసింగ్',
        clearTitle: '100% క్లియర్ టైటిల్, ధరణి పాస్‌బుక్ రెడీ'
      }
    },
    {
      id: 2,
      category: 'sale',
      image: 'assets/property-2.jpg',
      badge: 'అమ్మకానికి',
      title: 'ప్లాట్ - 400 గజాలు',
      location: 'గచ్చిబౌలి, హైదరాబాద్',
      price: '₹ 4.80 కోట్లు',
      unitPrice: '(₹ 1.20 లక్షలు / గజం)',
      specs: {
        approval: 'HMDA & RERA ఆమోదం పొందిన గేటెడ్ వెంచర్',
        facing: 'తూర్పు ముఖం (East Facing)',
        road: '60 అడుగుల సిసి రోడ్లు, అండర్‌గ్రౌండ్ విద్యుద్దీకరణ',
        possession: 'వెంటనే రిజిస్ట్రేషన్ మరియు నిర్మాణానికి సిద్ధం'
      }
    },
    {
      id: 3,
      category: 'sale',
      image: 'assets/property-3.jpg',
      badge: 'అమ్మకానికి',
      title: 'పొలం - 5 ఎకరాలు',
      location: 'శామీర్పేట, హైదరాబాద్',
      price: '₹ 5.00 కోట్లు',
      unitPrice: '(₹ 1.00 కోట్లు / ఎకరం)',
      specs: {
        type: 'ఫామ్‌ల్యాండ్ / రిసార్ట్ నిర్మాణానికి అనుకూలం',
        fencing: 'పూర్తిగా కాంపౌండ్ ఫెన్సింగ్ మరియు గేట్',
        plantation: 'మామిడి, కొబ్బరి మరియు టేకు తోట',
        connectivity: 'ఔటర్ రింగ్ రోడ్డు (ORR) కి 10 నిమిషాల దూరం'
      }
    },

    // --- కొనుగోలుకు ఆసక్తి (Buyer Inquiries / Wanted) ---
    {
      id: 4,
      category: 'wanted',
      image: 'assets/property-wanted-farm.jpg',
      badge: 'కొనుగోలుకు ఆసక్తి',
      title: 'వ్యవసాయ భూమి - 3 ఎకరాలు',
      location: 'చేవెళ్ల - శంకర్‌పల్లి రోడ్',
      price: '₹ 4.20 కోట్లు బడ్జెట్',
      unitPrice: '(తక్షణ నగదు కొనుగోలుదారు)',
      specs: {
        buyer: 'ధృవీకరించబడిన ఇన్వెస్టర్ క్లయింట్',
        purpose: 'ఆర్గానిక్ ఫామ్‌ల్యాండ్ / డ్రిప్ ఇరిగేషన్ ప్రాజెక్ట్',
        road: 'కనీసం 30 అడుగుల రోడ్ అప్రోచ్ తప్పనిసరి',
        clearTitle: 'ధరణి పాస్‌బుక్, 100% స్పష్టమైన టైటిల్'
      }
    },
    {
      id: 5,
      category: 'wanted',
      image: 'assets/property-wanted-logistics.jpg',
      badge: 'కొనుగోలుకు ఆసక్తి',
      title: 'లాజిస్టిక్స్ హబ్ - 10 ఎకరాలు',
      location: 'పటాన్‌చెరు - ORR గ్రోత్ కారిడార్',
      price: '₹ 25.00 కోట్లు బడ్జెట్',
      unitPrice: '(కార్పొరేట్ కొనుగోలు రిక్వెస్ట్)',
      specs: {
        buyer: 'ఎంఎన్‌సి వేర్‌హౌస్ & లాజిస్టిక్స్ క్లయింట్',
        frontage: '150 అడుగుల హైవే ఫేసింగ్ బిట్ అవసరం',
        zone: 'కమర్షియల్ / ఇండస్ట్రియల్ అనుమతి జోన్',
        possession: 'తక్షణ సేల్ డీడ్ లేదా జాయింట్ వెంచర్'
      }
    },
    {
      id: 6,
      category: 'wanted',
      image: 'assets/property-wanted-layout.jpg',
      badge: 'కొనుగోలుకు ఆసక్తి',
      title: 'ఓపెన్ ప్లాట్లు - 500 గజాలు',
      location: 'తుక్కుగూడ - ఎయిర్‌పోర్ట్ కారిడార్',
      price: '₹ 2.50 కోట్లు బడ్జెట్',
      unitPrice: '(NRI ఫ్యామిలీ కొనుగోలు)',
      specs: {
        buyer: 'ధృవీకరించబడిన NRI ప్రీమియం క్లయింట్',
        approval: 'HMDA & RERA అప్రూవ్డ్ గేటెడ్ లేఅవుట్',
        facing: 'తూర్పు లేదా ఈశాన్య ముఖం (Vaastu Compliant)',
        timeline: '15 రోజుల్లో పూర్తి రిజిస్ట్రేషన్ సిద్ధం'
      }
    },

    // --- అధిక విలువ గలవి (High Value / Luxury) ---
    {
      id: 7,
      category: 'high-value',
      image: 'assets/property-commercial.jpg',
      badge: 'అధిక విలువ గలవి',
      title: 'కమర్షియల్ బిట్ - 1200 గజాలు',
      location: 'కోకాపేట గోల్డెన్ మైల్, హైదరాబాద్',
      price: '₹ 18.00 కోట్లు',
      unitPrice: '(₹ 1.50 లక్షలు / గజం)',
      specs: {
        zone: 'మల్టీపర్పస్ హై-రైజ్ కమర్షియల్ జోన్',
        frontage: '120 అడుగుల మెయిన్ రోడ్ ఫేసింగ్',
        potential: 'హైరైజ్ ఐటీ / కార్పొరేట్ టవర్ నిర్మాణం',
        title: '100% క్లియర్ టైటిల్ & లీగల్ వెరిఫైడ్'
      }
    },
    {
      id: 8,
      category: 'high-value',
      image: 'assets/property-villa.jpg',
      badge: 'అధిక విలువ గలవి',
      title: 'అల్ట్రా లగ్జరీ విల్లా - 800 గజాలు',
      location: 'మోకిల - ఫైనాన్షియల్ డిస్ట్రిక్ట్ దగ్గర',
      price: '₹ 11.50 కోట్లు',
      unitPrice: '(సొంత ప్రైవేట్ పూల్ & లాన్)',
      specs: {
        builtUp: '7,500 చ.అడుగుల సూపర్ బిల్ట్-అప్ విస్తీర్ణం',
        features: 'ఇన్ఫినిటీ పూల్, హోమ్ థియేటర్, ప్రైవేట్ జిమ్',
        security: '24/7 కట్టుదిట్టమైన గేటెడ్ కమ్యూనిటీ',
        possession: 'వెంటనే చేరడానికి సిద్ధంగా ఉంది'
      }
    },
    {
      id: 9,
      category: 'high-value',
      image: 'assets/property-resort.jpg',
      badge: 'అధిక విలువ గలవి',
      title: 'లేక్‌ఫ్రంట్ రిసార్ట్ - 3.5 ఎకరాలు',
      location: 'గండిపేట చెరువు తీరం, హైదరాబాద్',
      price: '₹ 22.00 కోట్లు',
      unitPrice: '(ప్రైవేట్ జెట్టీ & వాటర్‌ఫ్రంట్)',
      specs: {
        view: 'ప్రత్యేక ఉస్మాన్ సాగర్ లేక్‌వ్యూ & జెట్టీ',
        amenities: 'ప్రైవేట్ డెక్, హెరిటేజ్ రాతి బంగ్లా, తోటలు',
        suitability: 'హై-ఎండ్ డెస్టినేషన్ వెడ్డింగ్ / ప్రైవేట్ రిట్రీట్',
        legality: 'పూర్తి అనుమతులు & క్లియర్ డాక్యుమెంటేషన్'
      }
    }
  ];

  function renderProperties(filterCategory = 'sale') {
    const grid = document.getElementById('properties-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = (filterCategory === 'all')
      ? propertyData
      : propertyData.filter(item => item.category === filterCategory);

    filtered.forEach((prop, index) => {
      const card = document.createElement('div');
      card.className = 'property-card';
      const isCardActive = (index === 1) ? ' active-btn' : '';
      card.innerHTML = `
        <div class="property-img-wrap">
          <img src="${prop.image}" alt="${prop.title}" class="property-img" loading="lazy">
          <span class="property-badge">${prop.badge}</span>
        </div>
        <div class="property-card-body">
          <div class="property-main-info">
            <h3 class="property-title" title="${prop.title}">${prop.title}</h3>
            <div class="property-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>${prop.location}</span>
            </div>
          </div>
          <div class="property-price-col">
            <div class="property-price">${prop.price}</div>
            <div class="property-unit-price">${prop.unitPrice}</div>
          </div>
          <button class="property-action-btn${isCardActive}" aria-label="వివరాలు చూడండి" onclick="window.ThulabaramApp.openPropertyModal(${prop.id})">
            <svg viewBox="0 0 24 24">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
  }


  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }


  // ==========================================================================
  // 5. Initialize Application & Event Listeners
  // ==========================================================================
  
  // ==========================================================================
  // Dynamic Statistics Counter & Real-Time Live Ticker Engine
  // ==========================================================================
  const DynamicStats = {
    initialized: false,
    registeredCount: 10482,

    init() {
      const statsSection = document.getElementById('trust-stats');
      if (!statsSection) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.initialized) {
            this.initialized = true;
            this.animateAll();
            this.startLiveTicker();
          }
        });
      }, { threshold: 0.15 });

      observer.observe(statsSection);
    },

    animateAll() {
      document.querySelectorAll('.dynamic-stat').forEach(el => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const isIndian = el.getAttribute('data-format') === 'indian';
        this.animateNumber(el, 0, target, 1800, suffix, isIndian);
      });
    },

    animateNumber(el, start, end, duration, suffix = '', isIndian = false) {
      let startTime = null;
      const easeOutQuad = (t) => t * (2 - t);

      const step = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easedProgress = easeOutQuad(progress);
        const currentVal = Math.floor(start + (end - start) * easedProgress);

        let formatted = currentVal.toString();
        if (isIndian) {
          formatted = currentVal.toLocaleString('en-IN');
        }

        el.textContent = formatted + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = (isIndian ? end.toLocaleString('en-IN') : end) + suffix;
        }
      };

      requestAnimationFrame(step);
    },

    startLiveTicker() {
      // Periodically tick registered land count live
      setInterval(() => {
        const regEl = document.getElementById('stat-registered');
        if (!regEl) return;

        const increment = Math.floor(Math.random() * 2) + 1;
        this.registeredCount += increment;

        regEl.classList.add('tick-pulse');
        regEl.textContent = this.registeredCount.toLocaleString('en-IN') + '+';

        setTimeout(() => {
          regEl.classList.remove('tick-pulse');
        }, 600);
      }, 5000);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    // 0. Initialize Dynamic Statistics Counter
    DynamicStats.init();

    // 1. Initialize HeroScaleVideo Component
    HeroScaleVideo.init();

    // 2. Initialize Property Listings
    renderProperties('sale');

    // 3. Category Filter Buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        renderProperties(filter);
      });
    });

    // 4. Valuation Search Form
    const valuationForm = document.getElementById('valuation-form');
    if (valuationForm) {
      valuationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const location = document.getElementById('val-location').value;
        const landType = document.getElementById('val-type').value;
        const area = document.getElementById('val-area').value;

        if (!area || area <= 0) {
          alert('దయచేసి సరైన విస్తీర్ణం నమోదు చేయండి (ఉదా: 2.5 ఎకరాలు లేదా 300 గజాలు)');
          return;
        }

        const result = ValuationEngine.calculate(location, landType, area);

        // Populate Result Modal
        document.getElementById('res-location').textContent = result.locationName;
        document.getElementById('res-type').textContent = result.landTypeTelugu;
        document.getElementById('res-area').textContent = `${result.areaValue} ${result.unitName}`;
        document.getElementById('res-total').textContent = result.totalFormatted;
        document.getElementById('res-unit-rate').textContent = result.unitRateFormatted;
        document.getElementById('res-govt-rate').textContent = result.govtRateFormatted;
        document.getElementById('res-accuracy').textContent = result.trustScore;

        openModal('valuation-result-modal');
      });
    }

    // 5. Mobile Navigation Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', () => {
        mobileDrawer.classList.toggle('open');
      });

      // Close drawer when clicking any link
      mobileDrawer.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('open');
        });
      });
    }

    // 6. Header Scroll Shadow
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // 7. Close Modals on Overlay Click or Escape
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal.id);
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => {
          closeModal(m.id);
        });
      }
    });
  });

  // Global helper object for buttons
  window.ThulabaramApp = {
    openModal,
    closeModal,
    openPropertyModal(id) {
      const prop = propertyData.find(p => p.id === id);
      if (!prop) return;

      document.getElementById('modal-prop-title').textContent = prop.title;
      document.getElementById('modal-prop-loc').textContent = prop.location;
      document.getElementById('modal-prop-price').textContent = prop.price;
      document.getElementById('modal-prop-unit').textContent = prop.unitPrice;
      document.getElementById('modal-prop-img').src = prop.image;

      const specsContainer = document.getElementById('modal-prop-specs');
      if (specsContainer) {
        specsContainer.innerHTML = '';
        Object.entries(prop.specs).forEach(([k, val]) => {
          const item = document.createElement('div');
          item.className = 'val-breakdown-card';
          item.innerHTML = `<div class="val-breakdown-label">వివరాలు</div><div class="val-breakdown-val">${val}</div>`;
          specsContainer.appendChild(item);
        });
      }

      openModal('property-detail-modal');
    },
    openExplainerVideo() {
      openModal('explainer-video-modal');
    }
  };

})();
