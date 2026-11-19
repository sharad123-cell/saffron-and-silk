const menus = {
  chaat: {
    image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=900&q=85',
    alt: 'Indian street food and chutneys',
    items: [
      ['Pani Puri', 'Mint, tamarind, spiced potato', '₹280'],
      ['Dahi Papdi Chaat', 'Chickpea, yoghurt, pomegranate', '₹320'],
      ['Paneer Tikka', 'Clay oven, mustard seed, lime pickle', '₹420'],
      ['Lucknowi Galouti', 'Awadhi kebab, ulte tawe ka paratha', '₹480']
    ]
  },
  mains: {
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=85',
    alt: 'Indian curry and rice thali',
    items: [
      ['Nalli Nihari', 'Slow-cooked lamb, garlic naan, ginger', '₹750'],
      ['Malabar Fish Curry', 'Coconut, curry leaf, steamed rice', '₹680'],
      ['Dal Bukhara', 'Black lentils, charcoal smoke, butter', '₹460'],
      ['Hyderabadi Dum Biryani', 'Saffron rice, rose, raita', '₹620']
    ]
  },
  sweets: {
    image: 'https://images.unsplash.com/photo-1666190094766-3e49fd27ce50?auto=format&fit=crop&w=900&q=85',
    alt: 'Traditional Indian sweets',
    items: [
      ['Gulab Jamun', 'Cardamom syrup, pistachio, rose', '₹220'],
      ['Kulfi Falooda', 'Saffron milk, basil seed, vermicelli', '₹260'],
      ['Jaggery Jalebi', 'Rabri, orange blossom, pistachio', '₹280'],
      ['Shrikhand', 'Mango, saffron, dry fruits', '₹240']
    ]
  }
};

const tabs = document.querySelectorAll('.tab');
const list = document.querySelector('#menu-list');
const image = document.querySelector('#category-image');

if (tabs.length && list && image) {
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const menu = menus[tab.dataset.category];

      image.style.opacity = '0';
      setTimeout(() => {
        image.src = menu.image;
        image.alt = menu.alt;
        image.style.opacity = '1';
      }, 180);

      list.innerHTML = menu.items.map(([name, description, price]) => `
        <article class="menu-item">
          <div><h2>${name}</h2><p>${description}</p></div><strong>${price}</strong>
        </article>
      `).join('');
    });
  });
}
