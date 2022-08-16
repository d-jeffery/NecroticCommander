// Player
class Necromancer extends EngineObject {
    constructor(pos) {
        super(pos, vec2(4), 0);
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
    constructor(pos, text, color) {
        super(pos, vec2( 15, 4));
        this.text = text;
        this.color = color;
        this.font = new FontImage();
        this.setCollision(1);
    }

    render() {
        drawRect(vec2(this.pos.x, this.pos.y), vec2( 15, 4), this.color);
        this.font.drawText(this.text, this.pos, 0.2, true);
    }

    collideWithObject(o) {
        if (o === cursor && mouseIsDown(0)) {

            engineObjects.forEach( (obj) => {
                if (obj instanceof Button) {
                    obj.color = new Color(1, 0, 0);
                }
            })

            this.color = new Color(0, 1, 0);
        }
        return false;
    }

}

class SkeletonButton extends Button {
    constructor(pos) {
        super(pos, "Summon\nSkeleton", new Color(1, 0, 0));
    }
}

class ExplosionButton extends Button {
    constructor(pos) {
        super(pos, "Corpse\nExplosion", new Color(1, 0, 0));
    }
}