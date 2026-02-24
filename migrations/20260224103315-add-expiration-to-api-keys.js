module.exports = {
  async up(db, client) {
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

    await db.collection('apikeys').updateMany(
      {
        expiresAt: { $exists: false },
        status: 'active'
      },
      {
        $set: {
          expiresAt: new Date(Date.now() + ninetyDaysMs)
        }
      }
    );
  },

  async down(db, client) {
    await db.collection('apikeys').updateMany(
      {},
      { $unset: { expiresAt: "" } }
    );
  }
};
