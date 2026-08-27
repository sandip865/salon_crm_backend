const Appointment = require('../models/appointment.model');
const Salon = require('../models/salon.model');

exports.getStats = async (req, res, next) => {
  try {
    const salonId = req.user.salonId;
    if (!salonId) {
      const error = new Error('salonId is required');
      error.statusCode = 400;
      throw error;
    }

    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    const appointmentsCount = await Appointment.countDocuments({
      salonId,
      date: dateString,
      isDeleted: false
    });

    const responseData = {
      todayAppointments: appointmentsCount
    };

    const salon = await Salon.findById(salonId).select('subscriptionStatus subscriptionEndDate');
    if (salon) {
      responseData.subscriptionStatus = salon.subscriptionStatus;
      responseData.subscriptionEndDate = salon.subscriptionEndDate;
    }

    res.json({ success: true, data: responseData });
  } catch (error) {
    next(error);
  }
};
