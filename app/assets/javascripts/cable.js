//= require action_cable
//= require_self

(function() {
  this.TalonCable || (this.TalonCable = {});
  this.TalonCable.cable = ActionCable.createConsumer();
}).call(this);
