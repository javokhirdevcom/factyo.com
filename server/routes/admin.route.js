const router = require('express').Router()
const Job = require('../models/job.model')
const User = require('../models/user.model')
const Message = require('../models/message.model')

// ── STATS ─────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const [totalJobs, activeJobs, completedJobs, totalUsers, revenueResult, recentJobs] =
      await Promise.all([
        Job.countDocuments(),
        Job.countDocuments({
          status: { $in: ['pending_ai', 'pending_approval', 'deposit_pending', 'scheduled', 'in_progress'] },
        }),
        Job.countDocuments({ status: 'completed' }),
        User.countDocuments({ role: { $ne: 'admin' } }),
        Job.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$finalPrice' } } },
        ]),
        Job.find()
          .populate('client', 'fullName email avatar')
          .sort({ createdAt: -1 })
          .limit(8)
          .select('title category status finalPrice address createdAt client'),
      ])

    const totalRevenue = revenueResult[0]?.total || 0

    res.json({
      success: true,
      stats: { totalJobs, activeJobs, completedJobs, totalUsers, totalRevenue },
      recentJobs,
    })
  } catch (err) {
    next(err)
  }
})

// ── JOBS ──────────────────────────────────────────────────────────────────────
router.get('/jobs', async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate('client', 'fullName email avatar')
      .sort({ createdAt: -1 })
    res.json({ success: true, jobs })
  } catch (err) {
    next(err)
  }
})

router.put('/jobs/:id/update', async (req, res, next) => {
  try {
    const { status, finalPrice, estimatedDuration } = req.body
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { status, finalPrice, estimatedDuration },
      { new: true },
    ).populate('client', 'fullName email')

    if (!updatedJob) return res.status(404).json({ success: false, message: 'Job not found' })
    res.json({ success: true, job: updatedJob })
  } catch (err) {
    next(err)
  }
})

// ── USERS ─────────────────────────────────────────────────────────────────────
router.get('/customers', async (req, res, next) => {
  try {
    const customers = await User.find({ role: { $ne: 'admin' } })
      .sort({ createdAt: -1 })
      .select('-password')
    res.json({ success: true, customers })
  } catch (err) {
    next(err)
  }
})

router.put('/users/:id/role', async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true },
    ).select('-password')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    next(err)
  }
})

router.delete('/users/:id', async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

// ── CONVERSATIONS ─────────────────────────────────────────────────────────────
router.get('/conversations', async (req, res, next) => {
  try {
    const msgGroups = await Message.aggregate([
      {
        $group: {
          _id: '$job',
          lastMessage: { $last: '$text' },
          lastAt: { $last: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { lastAt: -1 } },
    ])

    const jobIds = msgGroups.map((g) => g._id)
    const jobs = await Job.find({ _id: { $in: jobIds } })
      .populate('client', 'fullName email avatar')
      .select('title status category')

    const conversations = msgGroups
      .map((g) => ({
        ...g,
        job: jobs.find((j) => j._id.toString() === g._id.toString()),
      }))
      .filter((g) => g.job)

    res.json({ success: true, conversations })
  } catch (err) {
    next(err)
  }
})

module.exports = router
