function easeInSine(x) {
    return 1 - Math.cos((x * PI) / 2);
}

function easeOutBounce(x) {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}

function isDown() {
    return (mouseIsDown(0) || gamepadIsDown(0))
}

function isClicked(o) {
    return (o === cursor && mouseIsDown(0)) || (o === cursor && gamepadIsDown(0))
}

// Particles
function particleExplode(color1, color2, pos, size) {
    // Particle explosion
    return new ParticleEmitter(
        pos, 0, size, .1, 200, PI,  // pos, angle, emitSize, emitTime, emitRate, emiteCone
        0, vec2(16),                          // tileIndex, tileSize
        color1, color2,                       // colorStartA, colorStartB
        color1.scale(1, 0), color2.scale(1, 0), // colorEndA, colorEndB
        .2, 1, 1, .1, .05,    // particleTime, sizeStart, sizeEnd, particleSpeed, particleAngleSpeed
        .99, .95, .4, PI, .1, // damping, angleDamping, gravityScale, particleCone, fadeRate,
        1, 0, 1               // randomness, collide, additive, randomColorLinear, renderOrder
    );
}


// Player
class Necromancer extends EngineObject {
    constructor(pos) {
        super(pos, vec2(4), 9);
        this.setCollision(1, 1)
        this.renderOrder = 10
        this.health = 100;
        this.mana = 100;
        this.generationTime = 0;
        this.boltThrowTime = 0;

        const castle = new EngineObject(this.pos, vec2(5), 17, tileSizeDefault, 0, new Color, 15);
        this.addChild(castle, vec2(0, -3))
    }

    update() {
        if (this.health <= 0) {
            particleExplode(new Color(1, 0, 0), new Color(0, 0, 0), this.pos, this.size);
            particleExplode(new Color(.4, .4, .4), new Color(0, 0, 0), this.pos, this.size);

            return;
        }

        this.boltThrowTime += timeDelta;
        if (netherBoltButton.selected &&
            isClicked(cursor) &&
            cursor.pos.y > this.pos.y &&
            this.mana >= 10 &&
            this.boltThrowTime > 0.5) {

            const angle = cursor.pos.subtract(this.pos);
            const bolt = new Bolt(this.pos, angle.angle());
            bolt.applyForce(angle.normalize());
            this.mana -= 10;
            this.boltThrowTime = 0;
        }

        if (this.generationTime > 2 && this.mana < 100) {
            this.mana += 5;
            this.generationTime = 0;
        }
        this.generationTime += timeDelta;
    }
}

// Summons
class Grave extends EngineObject {
    constructor(pos) {
        super(pos, vec2(3), 5);
        this.setCollision(1);
        this.full = true;
    }

    refill() {
        this.full = true;
        this.tileIndex = 5;
    }

    collideWithObject(o) {
        if (!this.full) {
            return;
        }

        if (summonButton.selected && necromancer.mana - 10 >= 0) {
            if (isClicked(o)) {
                summons.push(new Summon(this.pos));
                this.full = false;
                this.tileIndex = 6
                necromancer.mana -= 10;

                // Particle explosion
                const color1 = new Color(0.70, 0.44, 0.44);
                const color2 = color1.lerp(new Color, .5);
                particleExplode(color1, color2, this.pos, this.size);
            }
        }
        return false;
    }
}

class Unit extends EngineObject {
    constructor(pos, tileIndex) {
        super(pos, vec2(3), tileIndex)
        this.setCollision(1, 1)
        this.friction = 0.9;
        this.mass = 10;
        this.elasticity = 0.5;
        this.maxVelocity = 0.1;

        this.target = undefined;
        this.health = 100;

        this.renderOrder = 1;
    }

    update() {
        super.update();
        if (this.health < 0) {
            particleExplode(new Color(1, 0, 0), new Color(0, 0, 0), this.pos, this.size);
            this.destroy();
        }
    }

    wander() {
        if (this.target === undefined) {
            const t = randInCircle(1);
            this.target = vec2(this.pos.x + t.x, this.pos.y + t.y);
        }

        this.moveTowardsTarget();
    }


    moveTowardsTarget(moveAlg) {
        if (moveAlg === undefined) {
            moveAlg = (p) => p
        }

        if (abs(this.pos.x - this.target.x) < 0.1 &&
            abs(this.pos.y - this.target.y) < 0.1) {
            this.target = undefined;
            // this.moveTime = 0;
            this.velocity = vec2(0, 0);
            return;
        } else {
            const angle = this.target.subtract(this.pos);
            this.applyForce(angle.scale(0.01));
        }

        this.velocity.x = clamp(this.velocity.x, -this.maxVelocity, this.maxVelocity);
        this.velocity.y = clamp(this.velocity.y, -this.maxVelocity, this.maxVelocity);

        // Clamp to screen size
        this.pos.x = clamp(this.pos.x, this.size.x / 2, levelSize.x - this.size.x / 2);
        this.pos.y = clamp(this.pos.y, this.size.y / 2 + 14, levelSize.y - this.size.y / 2);

        this.target.x = clamp(this.target.x, this.size.x / 2, levelSize.x - this.size.x / 2);
        this.target.y = clamp(this.target.y, this.size.y / 2 + 14, levelSize.y - this.size.y / 2);
    }

    attack(o, dmg) {
        o.health -= dmg;
    }
}

class Summon extends Unit {
    constructor(pos) {
        super(pos, Math.round(rand(2, 4)));
    }

    update() {
        super.update();
        if (enemies.length) {
            let closest = undefined;
            enemies.forEach((e) => {
                if (closest === undefined) {
                    closest = e.pos;
                }
                if (this.pos.distance(e.pos) < this.pos.distance(closest)) {
                    closest = e.pos;
                }
            })

            this.target = closest;

            this.moveTowardsTarget();
        } else {
            super.wander();
        }
    }

    collideWithObject(o) {
        if (o instanceof Enemy) {
            this.attack(o, 1)
            return true;
        } else if (o instanceof Unit || o instanceof Necromancer) {
            this.target = undefined;
            return true;
        }
        return false;
    }
}

class Enemy extends Unit {
    constructor(pos, tile) {
        super(pos, tile);
    }

    collideWithObject(o) {
        if (o instanceof Enemy) {
            this.target = undefined;
            return true;
        } else if (o instanceof Summon || o instanceof Necromancer) {
            this.attack(o, 1)
            return true;
        }
        return false;
    }
}

class Peasant extends Enemy {
    constructor(pos) {
        super(pos, Math.round(rand(7, 8)));
    }

    // TODO: Flee mechanic
    update() {
        super.update();

        // Huddle
        if (summons.length > enemies.length) {
            //Huddle
            this.target = enemies.reduce((t, e) => {
                return t.add(e.pos);
            }, vec2(0, 0)).scale(1 / enemies.length);
        } else if (summons.length > 0) {
            // Attack
            let closest = undefined;
            summons.forEach((e) => {
                if (closest === undefined) {
                    closest = e.pos;
                }
                if (this.pos.distance(e.pos) < this.pos.distance(closest)) {
                    closest = e.pos;
                }
            })

            this.target = closest;
        } else {
            this.target = necromancer.pos;
        }

        if (this.target) {
            this.moveTowardsTarget();
        } else {
            this.wander();
        }
    }
}

class Bolt extends EngineObject {
    constructor(pos, angle) {
        super(pos, vec2(2), 10, vec2(16), angle);
        this.setCollision(1, 1);
        this.renderOrder = 50;
    }

    collideWithObject(o) {
        if (o instanceof Unit) {
            this.destroy();
            o.health -= 50;
            particleExplode(new Color(0, 1, 0), new Color(0, 0, 0), this.pos, this.size);
            return true;
        }
        return false;
    }
}

// Cursor
class Cursor extends EngineObject {
    constructor(pos) {
        super(pos, vec2(2), 1, vec2(16), 0);
        this.setCollision(1, 1);

        this.addChild(new ParticleEmitter(
            vec2(0, 0), 0, objectDefaultSize, 0, 4, 0,  // pos, angle, emitSize, emitTime, emitRate, emiteCone
            0, tileSizeDefault,                              // tileIndex, tileSize
            new Color(1, 0, 0), new Color(0, 0, 0),   // colorStartA, colorStartB
            new Color(1, 0, 0, 0), new Color(0, 0, 0, 0), // colorEndA, colorEndB
            2, 0.5, .2, .1, .05,  // particleTime, sizeStart, sizeEnd, particleSpeed, particleAngleSpeed
            .99, 1, 1, PI, .05,  // damping, angleDamping, gravityScale, particleCone, fadeRate,
            .5, 0                // randomness, collide, additive, randomColorLinear, renderOrder
        ), vec2(0, -0.5), PI);

        this.renderOrder = 20
    }

    update() {
        if (isUsingGamepad) {
            // control with gamepad
            this.pos.x += gamepadStick(0).x;
            this.pos.y += gamepadStick(0).y;
        } else {
            // move to mouse
            this.pos.x = mousePos.x;
            this.pos.y = mousePos.y;
        }
        this.pos.x = clamp(this.pos.x, this.size.x / 2, levelSize.x - this.size.x / 2);
        this.pos.y = clamp(this.pos.y, this.size.y / 2, levelSize.y - this.size.y / 2)
    }
}

// Buttons
class Button extends EngineObject {
    constructor(pos, text, color, backgroundColor) {
        super(pos, vec2(11, 5));
        this.text = text;
        this.color = color;
        this.backgroundColor = backgroundColor;
        this.selected = false;
        this.font = new FontImage(undefined, vec2(8), vec2(0, 1), 0, mainContext);
        this.setCollision(1);
    }

    render() {
        if (this.selected) {
            this.color = new Color(1, 0, 1);
            this.backgroundColor = new Color(0.5, 0, 0.5)
        } else {
            this.color = new Color(1, 0, 0);
            this.backgroundColor = new Color(0.5, 0, 0);
        }

        drawRect(vec2(this.pos.x, this.pos.y), vec2(11, 5), this.backgroundColor, 0, false);
        drawRect(vec2(this.pos.x, this.pos.y), vec2(10, 4), this.color, 0, false);
        this.font.drawText(this.text, vec2(this.pos.x, this.pos.y + 1.5), 0.2, true);
    }

    collideWithObject(o) {
        if (isOverlapping(cursor.pos, cursor.size, this.pos, this.size) && isDown()) {
            engineObjects.forEach((obj) => {
                if (obj instanceof Button) {
                    obj.selected = false;
                }
            })
            this.selected = true;
        }
        return false;
    }
}

class RaiseDeadButton extends Button {
    constructor(pos) {
        super(pos, "Raise\nDead", new Color(1, 0, 0), new Color(0.5, 0, 0));
    }
}

class CorpseBombButton extends Button {
    constructor(pos) {
        super(pos, "Corpse\nBomb", new Color(1, 0, 0), new Color(0.5, 0, 0));
    }
}

class NetherBoltButton extends Button {
    constructor(pos) {
        super(pos, "Nether\nBolt", new Color(1, 0, 0), new Color(0.5, 0, 0));
    }
}

class RegenManaButton extends Button {
    constructor(pos) {
        super(pos, "Drain\nSoul", new Color(1, 0, 0), new Color(0.5, 0, 0));
    }
}