'use strict';

const {Component} = require('bluespess');

const _pulling = Symbol('_pulling');

class Puller extends Component {
	constructor(atom, template) {
		super(atom, template);
		this[_pulling] = null;
		this.a.on("before_move", this.before_move.bind(this));
		this.a.on("moved", this.moved.bind(this));
		if(this.a.c.Mob)
			this.a.c.Mob.on("click_on", this.click_on.bind(this));
	}

	click_on(e) {
		if(e.ctrlKey && e.atom) {
			if(this.pulling == e.atom)
				this.pulling = null;
			else
				this.pulling = e.atom;
		}
	}

	can_pull(target) {
		return this.a.server.has_component(target, "Tangible") && !target.c.Tangible.anchored
			&& this.a.z == target.z && Math.max(Math.abs(this.a.x - target.x), Math.abs(this.a.y - target.y)) <= 1;
	}

	before_move() {
		this.pulling = this.pulling; // refresh the pullability;
	}

	moved(movement) {
		if(!movement.offset || movement.offset.z != 0 || this[_pulling] == null)
			return;
		var oldx = this.a.x - movement.offset.x;
		var oldy = this.a.y - movement.offset.y;
		if(Math.abs(this[_pulling].x - this.x) > 2.00001 || Math.abs(this[_pulling].y - this.y) > 2.00001) {
			this.pulling = null;
			return;
		}
		// no diagonal drags if you don't need it
		if(this[_pulling].x != oldx && this[_pulling].y != oldy && Math.abs(this[_pulling].x - this.a.x) <= 1.00001 && Math.abs(this[_pulling].y - this.a.y) <= 1.00001) {
			return;
		}
		this.pulling.glide_size = this.a.glide_size;
		this.pulling.move(oldx - this.pulling.x, oldy - this.pulling.y, "pulled");
	}

	get pulling() {
		return this[_pulling];
	}

	set pulling(val) {
		if(val != null && !this.can_pull(val)) {
			if(val != this[_pulling])
				return;
			val = null;
		}
		if(val == this[_pulling])
			return;
		this[_pulling] = val;
		this.emit("pulling_changed", val);
	}
}

Puller.loadBefore = ["Mob"];

module.exports.components = {Puller};