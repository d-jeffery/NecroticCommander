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

// Particles
function particleExplode(color1, color2, pos, size) {
    // Particle explosion
    return new ParticleEmitter(
        pos, 0, size, .1, 200, PI,  // pos, angle, emitSize, emitTime, emitRate, emiteCone
        0, vec2(16),                          // tileIndex, tileSize
        color1, color2,                       // colorStartA, colorStartB
        color1.scale(1,0), color2.scale(1,0), // colorEndA, colorEndB
        .2, 1, 1, .1, .05,    // particleTime, sizeStart, sizeEnd, particleSpeed, particleAngleSpeed
        .99, .95, .4, PI, .1, // damping, angleDamping, gravityScale, particleCone, fadeRate,
        1, 0, 1               // randomness, collide, additive, randomColorLinear, renderOrder
    );
}


// Player
class Necromancer extends EngineObject {
    constructor(pos) {
        super(pos, vec2(4), 0);
        this.health = 10;
        this.mana = 10;
    }

    // Enable for movement.
    // update() {
    //     if (isUsingGamepad) {
    //         this.pos.x += gamepadStick(1).x;
    //     } else if (keyIsDown(37)) {
    //         this.pos.x -= 0.2;
    //     } else if (keyIsDown(39)) {
    //         this.pos.x += 0.2;
    //     }
    //     this.pos.x = clamp(this.pos.x, this.size.x/2, levelSize.x - this.size.x/2);
    // }
}

// Summons
class Grave extends EngineObject {
    constructor(pos) {
        super(pos, vec2(3), 5);
        this.setCollision(1);
    }

    collideWithObject(o) {
        if (summonButton.selected) {
            if ((o === cursor && mouseIsDown(0)) ||
                (o === cursor && gamepadIsDown(0))) {
                summons.push(new Summon(this.pos));

                // Particle explosion
                const color1 = new Color(0.70, 0.44, 0.44);
                const color2 = color1.lerp(new Color, .5);
                particleExplode(color1, color2, this.pos, this.size);

                this.destroy();
            }
        }
        return false;
    }
}

class Unit extends EngineObject {
    constructor(pos, tileIndex) {
        super(pos, vec2(3), tileIndex)
        this.setCollision(1, 1)
        this.target = undefined;
        this.health = 100;
        this.moveTime = 0;
        this.moveSpeed = 0.01;
    }

    update() {
        super.update();
        if (this.health < 0){
            const color1 = new Color(1, 0, 0);
            const color2 = new Color(0, 0, 0);
            particleExplode(color1, color2, this.pos, this.size);
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

        // Chasing
        // TODO: clamp make sure hub is not entered
        this.target.x = clamp(this.target.x, this.size.x / 2, levelSize.x - this.size.x / 2);
        this.target.y = clamp(this.target.y, this.size.y / 2, levelSize.y - this.size.y / 2);

        if (abs(this.pos.x - this.target.x) < 0.1 &&
            abs(this.pos.y - this.target.y) < 0.1) {
            this.target = undefined;
            this.moveTime = 0;
            return;
        }

        this.pos.x = lerp(moveAlg(this.moveTime), this.pos.x, this.target.x)
        this.pos.y = lerp(moveAlg(this.moveTime), this.pos.y, this.target.y)

        this.moveTime += this.moveSpeed * timeDelta;
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

            this.moveTowardsTarget(easeOutBounce);
        } else {
            super.wander();
        }
    }

    collideWithObject(o) {
        if (o instanceof Enemy) {
            this.attack(o, 1)
            return true;
        } else if (o instanceof Unit) {
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
}

class Peasant extends Enemy {
    constructor(pos) {
        super(pos, Math.round(rand(6, 7)));
    }

    // TODO: Flee mechanic
    update() {
        super.update();

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

        if (this.target) {
            this.moveTowardsTarget(smoothStep);
            return;
        }

        // Huddle
        // this.target = enemies.reduce((t, e) => {
        //     return t.add(e.pos);
        // }, vec2(0,0)).scale(1 / enemies.length);

    }

    collideWithObject(o) {
        if (o instanceof Enemy) {
            this.target = undefined;
            return true;
        } else if (o instanceof Summon) {
            this.attack(o, 1)
            return true;
        }
        return false;
    }
}


// Cursor
class Cursor extends EngineObject {
    constructor(pos) {
        super(pos, vec2(3), 1, vec2(16), 0);
        this.setCollision(1,1);

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
        this.pos.y = clamp(this.pos.y, this.size.y / 2, levelSize.y - this.size.y / 2);
    }
}

// Buttons
class Button extends EngineObject {
    constructor(pos, text, color, backgroundColor) {
        super(pos, vec2( 15, 4));
        this.text = text;
        this.color = color;
        this.backgroundColor = backgroundColor;
        this.selected = false;
        this.font = new FontImage();
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

        drawRect(vec2(this.pos.x, this.pos.y), vec2( 15, 5), this.backgroundColor);
        drawRect(vec2(this.pos.x, this.pos.y), vec2( 14, 4), this.color);
        this.font.drawText(this.text, vec2(this.pos.x, this.pos.y + 1.5), 0.2, true);
    }

    collideWithObject(o) {
        if ((o === cursor && mouseIsDown(0)) || (o === cursor && gamepadIsDown(0))) {
            engineObjects.forEach( (obj) => {
                if (obj instanceof Button) {
                    obj.selected = false;
                }
            })
            this.selected = true;
        }
        return false;
    }
}

class SummonButton extends Button {
    constructor(pos) {
        super(pos, "Summon\nUndead", new Color(1, 0, 0), new Color(0.5, 0, 0));
    }
}

class ExplosionButton extends Button {
    constructor(pos) {
        super(pos, "Corpse\nExplosion", new Color(1, 0, 0), new Color(0.5, 0, 0));
    }
}