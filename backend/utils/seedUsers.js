const User = require('../models/User');
const mockProfiles = require('../config/mockProfiles');

const seededUserIds = [
  '111122223333',
  '222233334444',
  '333344445555',
  '444455556666',
  '555566667777',
  '666677778888',
];

const seededContactData = {
  '111122223333': { phone: '9000000001', address: 'Banjara Hills, Hyderabad' },
  '222233334444': { phone: '9000000002', address: 'Clock Tower Road, Nalgonda' },
  '333344445555': { phone: '9000000003', address: 'Lalapet, Guntur' },
  '444455556666': { phone: '9000000004', address: 'Benz Circle, Vijayawada' },
  '555566667777': { phone: '9000000005', address: 'Wyra Road, Khammam' },
  '666677778888': { phone: '9000000006', address: 'Trunk Road, Ongole' },
};

const seedUsers = async () => {
  for (const aadhaarId of seededUserIds) {
    const profile = mockProfiles[aadhaarId];
    const contact = seededContactData[aadhaarId] || { phone: '', address: '' };

    await User.findOneAndUpdate(
      { aadhaarId },
      {
        ...profile,
        phone: contact.phone,
        address: contact.address,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Seeded ${seededUserIds.length} demo users into MongoDB.`);
};

module.exports = seedUsers;
