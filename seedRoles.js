const mongoose = require('mongoose');
const Role = require('./src/models/role.model');

mongoose.connect('mongodb://localhost:27017/salon_crm').then(async () => {
  try {
    const rolesData = [
      {
        name: 'SUPER_ADMIN',
        permissions: [
          { resource: 'Dashboard', actions: ['R'] },
          { resource: 'Manage Plans', actions: ['C', 'R', 'U', 'D'] },
          { resource: 'Manage Salons', actions: ['C', 'R', 'U', 'D'] },
          { resource: 'Subscription History', actions: ['R'] },
          { resource: 'User Management', actions: ['C', 'R', 'U', 'D'] },
          { resource: 'Clients', actions: ['C', 'R', 'U', 'D'] },
          { resource: 'Appointments', actions: ['R'] },
          { resource: 'Staff', actions: ['R'] },
          { resource: 'Services', actions: ['R'] }
        ]
      },
      {
        name: 'SALON_OWNER',
        permissions: [
          { resource: 'Dashboard', actions: ['R'] },
          { resource: 'Appointments', actions: ['C', 'R', 'U', 'D'] },
          { resource: 'Clients', actions: ['R'] },
          { resource: 'Subscription Status', actions: ['R'] }
        ]
      },
      {
        name: 'RECEPTIONIST',
        permissions: [
          { resource: 'Appointments', actions: ['C', 'R'] },
          { resource: 'Clients', actions: ['R'] }
        ]
      }
    ];

    const validRoleIds = [];

    for (const rData of rolesData) {
      let role = await Role.findOne({ name: rData.name });
      if (!role) {
        role = new Role({ name: rData.name, permissions: rData.permissions });
        await role.save();
        console.log('Created role:', rData.name);
      } else {
        role.permissions = rData.permissions;
        await role.save();
        console.log('Updated role:', rData.name);
      }
      validRoleIds.push(role._id);
    }

    const deleteResult = await Role.deleteMany({ _id: { $nin: validRoleIds } });
    console.log('Deleted obsolete roles count:', deleteResult.deletedCount);

    console.log('Roles successfully updated.');
  } catch (error) {
    console.error('Error updating roles:', error);
  } finally {
    process.exit(0);
  }
});
