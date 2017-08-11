
declare var window;
/**
 * Theatro is a simple JavaScript animation library.
 * @module Theatro
 * @namespace
 */
export namespace Theatro {

    export const getRequestAnimationFrame = () => {
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) { // If there is no browser support.
                    return window.setTimeout(callback, 1000 / 60);
                });
        }
    }

    export const setAttributes = (obj, attributes) => {
        for (let attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                obj[attribute] = attributes[attribute];
            }
        }
    }

    /**
     * @class Theatro.BoundingBox
     * @classdesc Represents a bounding box area.
     * @constructs Theatro.BoundingBox
     * @memberof Theatro
     * @param xMin {Number} The smallest x coordinate in the bounding box area.
     * @param yMin {Number} The smallest y coordinate in the bounding box area.
     * @param xMax {Number} The largest x coordinate in the bounding box area.
     * @param yMax {Number} The largest y coordinate in the bounding box area.
     */
    export class BoundingBox {

        xMin: number;
        yMin: number;
        xMax: number;
        yMax: number;
        constructor(xMin, yMin, xMax, yMax) {
            this.xMin = xMin;
            this.yMin = yMin;
            this.xMax = xMax;
            this.yMax = yMax;
        }

        /**
         * Create a BoundingBox instance using width and height.
         * @method Theatro.BoundingBox.fromSize
         * @memberof Theatro.BoundingBox
         * @param xMin {Number}
         * @param yMin {Number}
         * @param width {Number}
         * @param height {Number}
         * @return {Theatro.BoundingBox}
         */
        static fromSize(xMin, yMin, width, height) {
            return new BoundingBox(xMin, yMin, xMin + width, yMin + height);
        }

        /**
         * Get the width of this BoundingBox.
        * @method Theatro.BoundingBox#getWidth
        * @memberof Theatro.BoundingBox
        * @return {Number} The width of this BoundingBox in pixels.
        */
        getWidth() {
            return this.xMax - this.xMin;
        }

        /**
         * Get the height of this BoundingBox.
        * @method Theatro.BoundingBox#getHeight
        * @memberof Theatro.BoundingBox
        * @return {Number} The height of this BoundingBox in pixels.
        */
        getHeight() {
            return this.yMax - this.yMin;
        }

    }

    /**
     * @class Theater
     * @constructs Theater
     * @memberof Theatro
     */
    export class Theater {
        /**
         * The Productions this Theater can perform.
         * @memberof Theatro.Theater
         * @name Theatro.Theater#productions
         * @type Object
         * @default {}
         */
        productions = {};
        currentProduction: Production;
        /**
         * The Stages in this Theater.
         * @memberof Theatro.Theater
         * @name Theatro.Theater#stages
         * @type Object
         * @default {}
         */
        stages = {};

        /**
         * Executed at the start of a Production.
         * @memberof Theatro.Theater
         * @name Theatro.Theater#onCurtainUp
         * @type {Function}
         * @default null
         */
        onCurtainUp = null;

        /**
         * Executed at the end of a Production.
         * @name Theatro.Theater#onCurtainDown
         * @type {Function}
         * @default null
         */
        onCurtainDown = null;

        /**
         * Whether the Theatre is current performing.
         * @name Theatro.Theater#performing
         * @type {Boolean}
         * @default false
         */
        performing = false;


        /**
         * Add a stage to the theater.
         * @method Theater.AddStage
         * @memberof Theatro.Theater
         * @param name {String}   Name of the stage.
         * @param width {Number}  Width of the stage.
         * @param height {Number} Height of the stage.
         */
        addStage(name, width, height) {
            this.stages[name] = new Stage(width, height);
            this.stages[name].name = name;
        }

        /**
         * Add a Production to this Theater instance.
         * @param production {Production} The production to add.
         */
        addProduction(production) {
            production.theater = this;
            this.productions[production.title] = production;
        }

        /**
         * Rehearse (i.e., initialise) a production.
         * @param title {String} The title of the production to rehearse.
         */
        rehearse(title, scene) {
            if (this.productions.hasOwnProperty(title)) {
                this.currentProduction = this.productions[title];
                this.currentProduction.rehearse(scene);
            } else {
                throw "Cannot rehearse production '" + title + "'. " +
                "No production of that name known.";
            }
        }

        /**
         * Perform the current Production.
         */
        perform() {
            this.performing = true;
            this.onCurtainUp && this.onCurtainUp();
            this._perform();
        }

        _perform() {
            if (!this.currentProduction.ended && this.performing) {
                this.currentProduction.perform();
                this.currentProduction.show();
                var that = this;
                requestAnimationFrame(function () { that._perform(); });
            } else {
                this.performing = false;
                this.onCurtainDown && this.onCurtainDown();
            }
        }

    }
    /**
     * @class Theatro.Stage
     * @classdesc A stage on which productions are performed by actors.
     * @constructs Theatro.Stage
     * @memberof Theatro
     * @param width {Integer}  Width of the stage in pixels.
     * @param height {Integer} Height of the stage in pixels.
     */
    export class Stage {

        name: string;
        canvas: any;
        context: any;
        onStage: BoundingBox;
        offStage: BoundingBox;
        width: number;
        height: number;
        constructor(width, height) {

            /**
             * The name of the Stage.
             * @memberof Theatro.Stage
             * @name Theatro.Stage#name
             * @type {String}
             * @default ""
             */
            this.name = "";

            /**
             * The HTML5 canvas for the stage.
             * @memberof Theatro.Stage
             * @name Theatro.Stage#canvas
             * @type {Canvas}
             * @default {Canvas}
             */
            this.canvas = document.createElement('canvas');

            /**
             * The 2d context for the HTML5 canvas.
             * @memberof Theatro.Stage
             * @name Theatro.Stage#context
             * @type {CanvasRenderingContext2D}
             * @default {CanvasRenderingContext2D}
             */
            this.context = this.canvas.getContext('2d');

            this.setSize(width, height);
            this.setOffStage(0, 0, 0, 0);
        }


        /**
         * Set the size of the Stage.
         * @method Theatro.Stage#setSize
         * @memberof Theatro.Stage
         * @param width {Integer}  Width of the stage in pixels.
         * @param height {Integer} Height of the stage in pixels.
         */
        setSize(width, height) {

            /**
             * {@link Theatro.BoundingBox} describing the area of the stage.
             * @name Theatro.Stage#onStage
             * @memberof Theatro.Stage
             * @type {Theatro.BoundingBox}
             * @default BoundingBox(0, 0, this.width, this.height)
             */
            this.onStage = BoundingBox.fromSize(0, 0, width, height);

            /**
             * {@link Theatro.BoundingBox} describing an area outside the stage
             * (i.e., 'offstage').
             * @name Theatro.Stage#offStage
             * @memberof Theatro.Stage
             * @type {Theatro.BoundingBox}
             * @default BoundingBox(0, 0, this.width, this.height)
             */
            this.offStage = this.offStage = BoundingBox.fromSize(0, 0, width, height);

            this.canvas.width = this.width = width;
            this.canvas.height = this.height = height;
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        /**
         * Set the 'offstage' margins (outside the canvas).
         * @method Theatro.Stage#setOffStage
         * @memberof Theatro.Stage
         * @param offStageLeft {Integer} Left margin outside the stage.
         * @param offStageTop {Integer} Top margin outside the stage.
         * @param offStageRight {Integer} Right margin outside the stage.
         * @param offStageBottom {Integer} Bottom margin outside the stage.
         */
        setOffStage(offStageLeft, offStageTop,
            offStageRight, offStageBottom) {
            if (typeof (offStageLeft) === "undefined") {
                this.offStage = this.offStage = BoundingBox.fromSize(0, 0,
                    this.width, this.height);
            } else if (typeof (offStageTop) === "undefined") {
                this.offStage = BoundingBox.fromSize(-offStageLeft, -offStageLeft,
                    this.width + offStageLeft, this.height + offStageLeft);
            } else if (typeof (offStageRight) === "undefined") {
                this.offStage = BoundingBox.fromSize(-offStageLeft, -offStageTop,
                    this.width + offStageLeft, this.height + offStageTop);
            } else {
                this.offStage = BoundingBox.fromSize(-offStageLeft, -offStageTop,
                    this.width + offStageRight, this.height + offStageBottom);
            }
        }


        /**
         * Clean up the stage.
         * @method Theatro.Stage#cleanUp
         * @memberof Theatro.Stage
         * @param area {Array} a 4-tuple of numbers representing the BoundingBox
         *                      to clear [x, y, width, height]. If null the whole
         *                      stage will be cleared.
         */
        cleanUp(area?: Array<number>) {
            if (area) {
                this.context.clearRect.apply(area);
            } else {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }

        /**
         * Overridable callback
         * @method Theatro.Stage#preShow
         * @memberof Theatro.Stage
         */
        preShow() { }

        /**
         * Overridable callback
         * @method Theatro.Stage#postShow
         * @memberof Theatro.Stage
         */
        postShow() { }

        /**
         * Show the stage (i.e., clear every actor off the stage).
         * @method Theatro.Stage#show
         * @memberof Theatro.Stage
         */
        show() {
            this.cleanUp();
        }

    }
    /**
     * @class Theatro.Production
     * @classdesc Productions that are performed by actors in a theater.
     * @memberof Theatro
     * @param title {String} The title of the Production.
     * @constructor
     */
    export class Production {

        title: string;
        theater: Theater;
        stage: Stage;
        cast: Cast;
        ended: boolean;
        constructor(title) {

            /**
             * The title of the Production.
             * @memberof Theatro.Production
             * @name Theatro.Production#title.
             * @type {String}
             */
            this.title = title;

            /**
             * The theater where the production is performed.
             * @memberof Theatro.Production
             * @name Theatro.Production#theater
             * @type {Theater}
             * @default null
             */
            this.theater = null;

            /**
             * The stage on which the production is performed.
             * @memberof Theatro.Production
             * @name Theatro.Production#stage
             * @type {Theatro.Stage}
             * @default null
             */
            this.stage = null;

            /**
             * The cast which performs the production.
             * @memberof Theatro.Production
             * @name Theatro.Production#cast
             * @type {Cast}
             * @default null
             */
            this.cast = new Cast();

            /**
             * Whether the production has ended.
             * @memberof Theatro.Production
             * @name Theatro.Production#ended
             * @type {Boolean}
             * @default false
             */
            this.ended = false;
        }


        /**
         * Add an actor to the cast of the production.
         *
         * This is the recommended way of adding actors to the
         * cast as a reference to the Production instance
         * is added to the Actor instance. Internally This
         * method calls {@link Theatro.Cast#AddActor}.
         *
         * @method Theatro.Production#addActor
         * @memberof Theatro.Production
         * @param  {Theatro.Actor} actor
         */
        addActor(actor) {
            actor.production = this;
            this.cast.addActor(actor);
        }

        /**
         * Rehearse (i.e., initialise) each cast member for a
         * scene at the start of the production.
         * @method Theatro.Production#rehearse
         * @memberof Theatro.Production
         * @param scene {String} The name of the scene to rehearse.
         *                       If omiited, the opening scene of the production
         *                       will be rehearsed.
         */
        rehearse(scene) {
            this.cast.rehearse(scene);
            this.ended = false;
        }

        /**
         * Show the production on the stage.
         * @method Theatro.Production#show
         * @memberof Theatro.Production
         */
        show() {
            this.stage.cleanUp();
            this.stage.preShow();
            this.cast.show();
            this.stage.postShow();
        }

        /**
         * Direct the cast members to perform.
         * @method Theatro.Production#perform
         * @memberof Theatro.Production
         */
        perform() {
            this.cast.perform();
            this.ended = !(this.cast.getActiveActorCount() > 0);
        }

        /**
         * Cut to to the specified scene.
         * @method Theatro.Production#cutToScene
         * @memberof Theatro.Production
         * @param sceneTitle {String} the title of the next scene.
         */
        cutToScene(sceneTitle) {
            this.cast.cutToScene(sceneTitle);
        }

    }

    /**
     * @class Theatro.Cast
     * @classdesc The Cast class represents the actors in a production.
     * @constructs Theatro.Cast
     * @memberof Theatro
     */
    export class Cast {

        actors: any[];
        _activeActorCount: number;
        constructor() {
            /**
             * The actors in the class.
             * @memberof Theatro.Cast
             * @name Theatro.Cast#actors
             * @type {Theatro.Actor[]}
             * @default Array()
             */
            this.actors = new Array();
            this._activeActorCount = 0;
        }

        /**
         * Get the number of active actors.
         *
         * This method should only be called when the cast are performing.
         * @method Theatro.Cast#getActiveActorCount
         * @memberof Theatro.Cast
         * @return {Number} the number of active actors.
         */
        getActiveActorCount() {
            return this._activeActorCount;
        }


        /**
         * Remove an actor from the cast.
         *
         * @method Theatro.Cast#addActor
         * @memberof Theatro.Cast
         * @param  actor {Theatro.Actor} The actor to remove.
         */
        removeActor(actor) {
            var i = this.actors.indexOf(actor);
            if (i >= 0) {
                this.actors = this.actors.splice(i, 1);
            }
        }

        /**
         * Add an actor to the cast.
         *
         * This method a reference to this Cast instance to the Actor instance.
         * See also {@link Theatro.Production#addActor}.
         *
         * @method Theatro.Cast#addActor
         * @memberof Theatro.Cast
         * @param  actor {Theatro.Actor} The new actor.
         */
        addActor(actor) {
            actor.cast = this;
            this.actors.push(actor);
        }

        /**
         * Rehearse (i.e., initialise) each actor in the cast
         * to the first scene of their scripts.
         * @method Theatro.Cast#rehearse
         * @memberof Theatro.Cast
         * @param scene {String}  the title of the scene to rehearse.
         *                        If null, the first scene in each actor's
         *                        script will be rehearsed.
         */
        rehearse(scene) {
            if (typeof (scene) === 'undefined') {
                this._activeActorCount = this.actors.length;
                for (var i = 0; i < this.actors.length; i++) {
                    this.actors[i].rehearse(this.actors[i].script.openingScene.title);
                    if (this.actors[i].resting) this._activeActorCount--;
                }
            } else {
                this._activeActorCount = this.actors.length;
                for (var i = 0; i < this.actors.length; i++) {
                    this.actors[i].rehearse(scene);
                    if (this.actors[i].resting) this._activeActorCount--;
                }
            }
        }

        /**
         * Cut to to the specified scene.
         * @method Theatro.Cast#cutToScene
         * @memberof Theatro.Cast
         * @param  sceneTitle {String} the title of the next scene.
         */
        cutToScene(sceneTitle) {
            for (var i = 0; i < this.actors.length; i++) {
                this.actors[i].cutToScene(sceneTitle);
            }
        }

        /**
         * Direct each actor in the cast to perform.
         *@method Theatro.Cast#perform
         * @memberof Theatro.Cast
         */
        perform() {

            this._activeActorCount = this.actors.length;
            for (var i = 0; i < this.actors.length; i++) {
                if (!this.actors[i].resting) {
                    var v = this.actors[i].perform();
                    if (!v) this._activeActorCount--;
                }
            }
        }

        /**
         * Show each actor on their stage (if they are not 'resting').
         * @method Theatro.Cast#show
         * @memberof Theatro.Cast
         */
        show() {
            for (var i = 0; i < this.actors.length; i++) {
                if (!this.actors[i].resting) {
                    this.actors[i].show();
                }
            }
        }

    }

    /**
     * @class Theatro.Actor
     * @classdesc The base Actor class.
     * @memberof Theatro
     * @constructs Theatro.Actor
     * @param name {String} The actor's name.
     */
    export class Actor {

        name: string;
        script: Script;
        props: any;
        resting: boolean;
        stage: Stage;
        cue: string;
        leading: boolean;
        clique: any;
        _notified: boolean;
        constructor(name) {

            /**
             * The actors's name.
             * @memberof Theatro.Actor
             * @name Theatro.Actor#name
             * @type {String}
             */
            this.name = name

            /**
             * The actor's script.
             * @memberof Theatro.Actor
             * @name Theatro.Actor#script
             * @type {Script}
             * @default Script()
             */
            this.script = new Script();
            this.script.actor = this;

            /**
             * The actor's props. An object that can be used to add arbitrary
             * data to the actor.
             * @memberof Theatro.Actor
             * @name Theatro.Actor#props
             * @type {Object}
             * @default {}
             */
            this.props = {}

            /**
             * Whether the actor is 'resting' (active but not performing).
             * @memberof Theatro.Actor
             * @name Theatro.Actor#resting
             * @type {Boolean}
             * @default false
             */
            this.resting = false;

            /**
             * The stage on which the actor performs and is shown.
             * @memberof Theatro.Actor
             * @name Theatro.Actor#stage
             * @type {Theatro.Stage}
             * @default null
             */
            this.stage = null;

            /**
             * The actors "cue": a flag which used control when
             * a cue starts or ends a scene.
             * @memberof Theatro.Actor
             * @name Theatro.Actor#cue
             * @type {String}
             * @default null
             */
            this.cue = null;

            /**
             * Whether the actor is a leading actor. Only leading actors can
             * notify their cliques (see {@link Theatro.Actor#notifyClique}).
             * @memberof Theator.Actor
             * @name Theatro.Actor#leading
             * @type {Boolean}
             * @default false
             */
            this.leading = false;

            /**
             * The actors clique: a group of actors which always act together.
             * @memberof Theator.Actor
             * @name Theatro.Actor#clique
             * @type {Actor[]}
             * @default [this]
             */
            this.clique = new Array(this);
            this._notified = false;
        }

        /**
         * Add actors to this actor's clique.
         * @memberof Theatro.Actor
         * @name Theatro.Actor#addToClique
         * @type {Actor[]}
         * @default []
         */
        addToClique(actor) {
            if (this.clique.indexOf(actor) < 0) {
                this.clique.push(actor);
                actor.addToClique(this);
            }
        }

        /**
         * Notify (apply a callback to) the actors in a clique. Only
         * leading actors can notify cliques (see {@link Theatro.Actor#leadning}).
         * @method Theatro.Actor#notifyClique
         * @memberof Theatro.Actor
         * @param notify {Function} The callback to execute for each actor.
         *                          The actor will be passed to the callback as a
         *                          parameter.
         */
        notifyClique(notify) {
            if (this.leading) {
                for (var i = 0; i < this.clique.length; i++) {
                    notify(this.clique[i]);
                }
            }
        }

        /**
         * Rehearse (i.e., initialise) the specified scene in the actor's script
         * @method Theatro.Actor#rehearse
         * @memberof Theatro.Actor
         * @param scene {String} The title of the scene to rehearse.
         */
        rehearse(scene) {
            this.script.rehearse(scene);
        }

        /**
         * Cut to the specified scene in the actor's script.
         * @method Theatro.Actor#cutToScene
         * @memberof Theatro.Actor
         * @param scene {String} The next scene title.
         */
        cutToScene(scene) {
            this.script.cutToScene(scene);
        }

        /**
         * Direct the actor to perform their script.
         * @method Theatro.Actor#perform
         * @memberof Theatro.Actor
         */
        perform() {
            return !this.script.perform();
        }

        /**
         * Show the actor on their stage.
         * @method Theatro.Actor#show
         * @memberof Theatro.Actor
         */
        show() { }

        /**
         * Set attributes for the actor en masse.
         * @method Theator.Actor#setAttributes
         * @memberof Theatro.Actor
         * @param attributes {Object} An object containt attribute-value pairs.
         */
        setAttributes(attributes) {
            setAttributes(this, attributes);
        }


    }
    /**
     * @class Theatro.Script
     * @classdesc The script for an Actor.
     * The script is essentially a finite state automaton with a few bells
     * and whistles.
     * @memberof Theatro
     * @constructs Theatro.Script
     */

    export class Script {

        scenes: any;
        openingScene: Scene;
        currentScene: Scene;
        ended: boolean;
        actor: Actor;
        constructor() {

            /**
             * The scenes in the script.
             * @memberof Theatro.Script
             * @name Theatro.Script#scenes
             * @type {Object}
             * @default {}
             */
            this.scenes = {};

            /**
             * The opening scene.
             * This can be set automatically using this Script#addScene() method.
             * @memberof Theatro.Script
             * @name Theatro.Script#openingScene
             * @type {Theatro.Scene}
             * @default null;
             */
            this.openingScene = null;

            /**
             * The current scene
             * This set by when calling the Script#rehearse() method.
             * @memberof Theatro.Script
             * @name Theatro.Script#currentScene
             * @type {Theatro.Scene}
             * @default null;
             */
            this.currentScene = null;

            /**
             * Whether the end of the script has been reached.
             * @memberof Theatro.Script
             * @name Theatro.Script#ended
             * @type {Boolean}
             * @default false
             */
            this.ended = false;

            /**
             * The actor for the script.
             * @memberof Theatro.Script
             * @name Theatro.Script#actor
             * @type {Theatro.Actor}
             * @default null
             */
            this.actor = null;

        }

        /**
         * Whether or not the script has the specified scene title.
         * @memberof Theatro.Script
         * @method Theatro.Script#hasScene
         * @param title {String} The scene title.
         * @return {Boolean}    true or false;
         */
        hasScene(title) {
            if (title) {
                return this.scenes.hasOwnProperty(title);
            } else {
                return false;
            }
        }

        /**
         * Rehearse (i.e., initialise) the specified scene.
         * @method Theatro.Script#rehearse
         * @memberof Theatro.Script
         * @param title {String} The title of the scene to rehearse.
         */
        rehearse(title) {
            if (title) {
                this.currentScene = this.scenes[title];
            } else {
                this.currentScene = this.openingScene;
            }
            this.currentScene.rehearse();
            this.ended = false;
        }

        /**
         * Adds a scene to the script.
         * @method Theatro.Script#addScene
         * @memberof Theatro.Script
         * @param  {Theatro.Scene} scene The scene to add
         * @param opening {Boolean} Whether this is the first scene in the script.
         *                           The first scene added to the script is automatically
         *                           made the opening scene, but this parameter can
         *                           be used to subsequently set the opening scene.
         */
        addScene(scene: Scene, opening: boolean = false) {
            this.scenes[scene.title] = scene;
            scene.actor = this.actor;
            if (opening || !this.openingScene) {
                this.openingScene = scene;
            }
        }

        /**
         * Add multiple scenes to the script.
         * @method Theatro.Script#addScenes
         * @memberof Theatro.Script
         * @param {Array|Object} scenes An array of Objects whose fields will be
         *                              used to instantiate {@link Theatro.Scene}
         *                              objects.
         */
        addScenes(scenes) {
            var i, parameter, scene;
            for (i = 0; i < scenes.length; i++) {
                scene = new Scene(scenes[i].title);
                this.addScene(scene);
                for (parameter in scenes[i]) {
                    if (scenes[i].hasOwnProperty(parameter)) {
                        scene[parameter] = scenes[i][parameter];
                    }
                }
            }
        }
        /**
         * Direct the script to perform the current scene.
         * @method Theatro.Script#perform
         * @memberof Theatro.Script
         */
        perform() {
            var nextSceneTitle = this.currentScene.perform();
            if (nextSceneTitle) {
                if (nextSceneTitle != this.currentScene.title) {
                    this.currentScene = this.scenes[nextSceneTitle];
                    this.currentScene.rehearse();
                }
            } else {
                this.ended = true;
            }
            return this.ended;
        }


        /**
         * Cut to the specified scene in the actor's script.
         * @method Theatro.Script#cutToScene
         * @memberof Theatro.Script
         * @param sceneTitle {String} The next scene title.
         */
        cutToScene(sceneTitle) {
            this.currentScene.cutToScene = sceneTitle;
        }

    }

    /**
     * @class Scene
     * @classdesc A Scene in a production script.
     * The Scene class represents a state for the Script finite state automaton.
     * @memberof Theatro
     * @constructs Theatro.Scene
     * @param title {String} The title of the scene.
     * @constructor
     */
    export class Scene {

        title: string;
        nextScene: string;
        cutToScene: string;
        switchToScene: string;
        preScene: any;
        postScene: any;
        actor: Actor;
        startOnCue: string;
        _startOnCue: string;
        endOnCue: string;
        _endOnCue: string;
        _endCue: string;
        encores: number;
        encore: number;
        duration: number;
        useTime: boolean;
        ended: boolean;
        frame: number;
        startTime: number;
        t: number;
        action: any;
        constructor(title) {
            this.title = title;

            /**
             * The title of the next scene.
             * @memberof Theatro.Scene
             * @name Theatro.Scene#nextScene
             * @type {String}
             * @default null;
             */
            this.nextScene = null;

            /**
             * A flag which when set will cut the current scene and jump to the scene
             * specified by this flag. Note, this attribute will be set to
             * <code>null</code> whenever the {@link Theatro.Scene#rehearse} method
             * is called.
             * @memberof Theatro.Scene
             * @name Theatro.Scene#cutToScene
             * @type {String}
             * @default null;
             */
            this.cutToScene = null;

            /**
             * A flag which when set will wait until the end of the current scene
             * and then switch to another scene specified by this flag.
             * Note, this attribute will be set to
             * <code>null</code> whenever the {@link Theatro.Scene#rehearse} method
             * is called.
             * @memberof Theatro.Scene
             * @name Theatro.Scene#switchToScene
             * @type {String}
             * @default null;
             */
            this.switchToScene = null;

            /**
             * If defined, executed at the beginning of the scene.
             * @memberof Theatro.Scene
             * @name Theatro.Scene#preScene
             * @type {Function}
             * @default null;
             */
            this.preScene = null;

            /**
             * If defined, executed at the end of the scene.
             * @memberof Theatro.Scene
             * @name Theatro.Scene#postScene
             * @type {Function}
             * @default null;
             */
            this.postScene = null;

            /**
             * The actor associated with this scene.
             * @memberof Theatro.Scene
             * @name Theatro.Scene#actor
             * @type {Theatro.Actor}
             * @default null;
             */
            this.actor = null;

            /**
             * If defined, wait until the cue attribute of the actor member
             * is equal to this value before starting this scene.
             * @memberof Theatro.Scene
             * @name Theatro.Scene#startOnCue
             * @type {String}
             * @default null;
             */
            this.startOnCue = null;

            /**
             * If defined, wait until the cue attribute of the actor member
             * is equal to this value before ending this scene.
             * @memberof Theatro.Scene
             * @name Theatro.Scene#endOnCue
             * @type {String}
             * @default null;
             */
            this.endOnCue = null;

            /**
             * The number of encores (repetitions) for the performance of this scene.
             * @memberof Theatro.Scene
             * @name Theatro.Scene#encores
             * @type {Number}
             * @default 0;
             */
            this.encores = 0;

            /**
             * Whether this scene has ended.
             * @memberof Theatro.Scene
             * @name Theatro.Scene#ended
             * @type {Boolean}
             * @default false;
             */
            this.ended = false;

            /**
             * Whether the duration of this scene is counted in milliseconds
             * or frames.
             * @memberof Theatro.Scene
             * @name Theatro.Scene#useTime
             * @type {Boolean}
             * @default false;
             */
            this.useTime = false;

            /**
             * The duration of this scene in frames or milliseconds
             * (see {@link Theatro.Scene#useTime})
             * @memberof Theatro.Scene
             * @name Theatro.Scene#duration
             * @type {Number}
             * @default false;
             */
            this.duration = 0;
        }

        /**
         * Rehearse (i.e., initialise) this scene.
         * @method Theatro.Scene#rehearse
         * @memberof Theatro.Scene
         */
        rehearse() {
            this.cutToScene = null;
            this.switchToScene = null;
            this.preScene && this.preScene(this.actor, this);
            this._startOnCue = this.startOnCue;
            this._endOnCue = this.endOnCue;

            this.ended = false;
            this.encore = this.encores;
            this.frame = 0;
            if (this.useTime) { this.startTime = new Date().getTime(); }
        }

        /**
         * Perform this scene.
         * @method Theatro.Scene#perform
         * @memberof Theatro.Scene
         * @return {String} the name of the next scene.
         */
        perform(): string {

            if (this.cutToScene) { return this.cutToScene; }
            if (this._startOnCue) {
                if (this.actor.cue === this._startOnCue) {
                    this.actor.resting = false;
                    this.actor.cue = this._startOnCue = null;
                } else {
                    return this.title;
                }
            }
            if (this.useTime) {
                this.frame = new Date().getTime() - this.startTime;
            }
            if (this.frame >= this.duration) {
                if ((this.encore > 0) || (this.encores < 0)) {
                    if (this._endCue && this.actor.cue === this._endCue) {
                        this._endCue = this.actor.cue = null;
                        this.ended = true;
                        this.postScene && this.postScene(this.actor, this);
                        if (this.cutToScene) { return this.cutToScene; }
                        if (this.switchToScene) { return this.switchToScene; }
                        return this.nextScene;
                    } else {
                        if (this.encore > 0) this.encore--;
                        if (this.useTime) {
                            this.startTime = new Date().getTime();
                        } else {
                            this.frame = 0;
                        }
                        return this.title;
                    }
                } else {
                    this.ended = true;
                    this.postScene && this.postScene(this.actor, this);
                    if (this.cutToScene) { return this.cutToScene; }
                    if (this.switchToScene) { return this.switchToScene; }
                    return this.nextScene;
                }
            } else {
                this.t = this.frame / this.duration;
                this.action(this.actor, this);
                if (!this.useTime) this.frame++;
                if (this.cutToScene) return this.cutToScene;
                return this.title;
            }
        }


    }
    /**
     * @class Theatro.CanvasActor
     * @classdesc An actor represented on an HTML5 canvas.
     * @memberof Theatro
     * @constructs Theatro.CanvasActor
     * @extends Theatro.Actor
     * @param [attributes] {Object} Attributes of the actor to be set after
     *                              default values have been set.
     */
    export class CanvasActor extends Actor {

        x: number;
        y: number;
        xShift: number;
        yShift: number;
        width: number;
        height: number;
        angle: number;
        angleShift: number;
        xScale: number;
        yScale: number;
        opacity: number;
        onShow: any;
        globalAlpha: any;
        constructor(attributes) {
            super(attributes.name);
            /**
             * x coordinate representing the center of the Actor position.
             * @memberof Theatro.CanvasActor
             * @name Theatro.CanvasActor#x
             * @type {Number}
             * @default 0
             */
            this.x = 0;

            /**
             * y coordinate representing the center of the Actor position.
             * @memberof Theatro.CanvasActor
             * @name Theatro.CanvasActor#y
             * @type {Number}
             * @default 0
             */
            this.y = 0;

            /**
             * Horizontal offset from the Actor position.
             * @memberof Theatro.CanvasActor
             * @name Theatro.CanvasActor#xShift
             * @type {Number}
             * @default 0
             */
            this.xShift = 0;

            /**
             * Vertical offset from the Actor position.
             * @memberof Theatro.CanvasActor
             * @name Theatro.CanvasActor#yShift
             * @type {Number}
             * @default 0
             */
            this.yShift = 0;

            /**
             * Width (in pixels) of this Actor.
             * @memberof Theatro.CanvasActor
             * @name Theatro.SPriteActor#width
             * @type {Number}
             * @default 0
             */
            this.width = 0;

            /**
             * Height (in pixels) of this Actor.
             * @memberof Theatro.CanvasActor
             * @name Theatro.CanvasActor#height
             * @type {Number}
             * @default 0
             */
            this.height = 0;

            /**
             * Major angle of rotation (in radians) for this Actor.
             * Rotation is around <code>(x + xShift, y + yShift)</code>.
             * @memberof Theatro.CanvasActor
             * @name Theatro.CanvasActor#angle
             * @type {Number}
             * @default 0
             */
            this.angle = 0;

            /**
             * Minor angle of rotation (in radians) for this Actor.
             * Rotation is around <code>(x + xShift, y + yShift)</code>.
             * @memberof Theatro.CanvasActor
             * @name Theatro.CanvasActor#angleShift
             * @type {Number}
             * @default 0
             */
            this.angleShift = 0;

            /**
             * Horizontal scale.
             * @memberof Theatro.CanvasActor
             * @name Theatro.CanvasActor#xScale
             * @type {Number}
             * @default 1
             */
            this.xScale = 1;

            /**
             * Vertical scale.
             * @memberof Theatro.CanvasActor
             * @name Theatro.CanvasActor#yScale
             * @type {Number}
             * @default 1
             */
            this.yScale = 1;

            /**
             * Opacity of this actor.
             * @memberof Theatro.CanvasActor
             * @name Theatro.CanvasActor#opacity
             * @type {Number}
             * @default 1
             */
            this.opacity = 1;


            /**
             * Executed when the actor is in position and is ready to
             * be shown.
             * Just before the actor is shown, a transformation is set up on the stage
             * canvas which shifts the origin to the appropriate position, rotation
             * scale and opacity. Then this callback is invoked.
             * @memberof Theatro.CanvasActor
             * @name Theatro.CanvasActor#onShow
             * @type {Function}
             * @default null
             */
            this.onShow = null;

            setAttributes(this, attributes);

        }




        /**
         * Show the actor on the stage
         * @method Theatro.CanvasActor#show
         * @memberof Theatro.CanvasActor
         */
        show() {
            let context = this.stage.context;
            let alpha = this.globalAlpha;
            context.save();
            context.translate(this.x + this.xShift, this.y + this.yShift);
            context.rotate(this.angle + this.angleShift);
            context.scale(this.xScale, this.yScale);
            context.globalAlpha = this.opacity;
            this.onShow && this.onShow(context);
            context.restore();
            this.globalAlpha = alpha;
        }

    }
    /**
     * @class Theatro.SpriteCanvasActor
     * @classdesc A CanvasActor which is drawn as a bitmap.
     * @memberof Theatro
     * @constructs Theatro.SpriteCanvasActor
     * @extends Theatro.CanvasActor
     * @param spriteSheet {Theatro.SpriteSheet} the sprite sheet source image.
     * @param [attributes] {Object} Argument passed on to the parent constructor.
     *                              See {@link Theatro.CanvasActor}.
     */
    export class SpriteCanvasActor extends CanvasActor {

        spriteSheet: SpriteSheet;
        spriteSheetIndex: number;

        constructor(spriteSheet, attributes) {
            super(attributes.name)
            this.spriteSheet = spriteSheet;

            /**
             * Sprite sheet index.
             * @memberof Theatro.SpriteCanvasActor
             * @name Theatro.SpriteCanvasActor.spriteSheetIndex
             * @type {Number}
             * @default 0
             */
            this.spriteSheetIndex = 0


            this.onShow = (context) => {
                this.spriteSheet.render(context, -this.width / 2, -this.height / 2,
                    this.width, this.height, this.spriteSheetIndex);
            }

            setAttributes(this, attributes);
        }

    }

    /**
     * @class Theatro.SpriteSheet
     * @classdesc A sheet (i.e., a single image) containing a grid of
     * sprites of the same size.
     * @memberof Theatro
     * @constructs Theatro.SpriteSheet
     * @param image {Image} The base image for the sprite sheet.
     * @param m {Number} The number of rows in the sprite sheet.
     * @param n {Number} The number of columns in the sprite sheet.
     */
    export class SpriteSheet {
        _image: any;
        _m: number;
        _n: number;
        _spriteWidth: number;
        _spriteHeight: number;

        constructor(image, m, n) {
            this._image = image;
            this._m = m;
            this._n = n;
            this._spriteWidth = this._image.width / n;
            this._spriteHeight = this._image.height / m;
        }

        /**
         * Return the number of rows in the sprite sheet.
         * @method Theatro.SpriteSheet#getRows
         * @memberof Theatro.SpriteSheet
         * @return {Number} The number of rows.
         */
        getRows() { return this._m; }

        /**
         * Return the number of columns in the sprite sheet.
         * @method Theatro.SpriteSheet#getColumns
         * @memberof Theatro.SpriteSheet
         * @return {Number} The number of columns.
         */
        getColumns() { return this._n; }

        /**
         * Return the number of spritesin the sprite sheet.
         * @method Theatro.SpriteSheet#getSpriteCount
         * @memberof Theatro.SpriteSheet
         * @return {Number} The number of sprites.
         */
        getSpriteCount() { return this._m * this._n; }

        /**
         * Return the width of each sprite in the sprite sheet
         * @method Theatro.SpriteSheet#getSpriteWidth
         * @memberof Theatro.SpriteSheet
         * @return {Number} The width of each sprite.
         */
        getWidth() { return this._spriteWidth; }

        /**
         * Return the height of each sprite in the sprite sheet
         * @method Theatro.SpriteSheet#getSpriteHeight
         * @memberof Theatro.SpriteSheet
         * @return {Number} The height of each sprite.
         */
        getHeight() { return this._spriteHeight; }

        /**
         * Render a sprite on the canvas
         * @method Theatro.SpriteSheet#render
         * @param {CanvasRenderingContext2D} context The HTML5 canvas context on which
         *                                           to render the sprite.
         * @param x {Number} The x coordinate (in pixels) of the center of the sprite on the canvas.
         * @param y {Number} The y coordinate (in pixels) of the center of the sprite on the canvas.
         * @param width {Number} The width (in pixels) of the sprite on the canvas.
         * @param height {Number} The height (in pixels) of the sprite on the canvas.
         * @param i {Number} The (row) index of the sprite. If the next parameter is
         *                   not given, then the row index is taken to be
         *                   <code> i % m </code> and the column index
         *                    is <code> Math.floor(i / m) </code>
         *                   where <code> m </code> is the number of
         *                   rows in the sprite sheet.
         * @param [j {Number}=null] The column index of the sprite.
         */
        render(context, x, y, width, height, i, j?: number) {
            var m, n;
            if (typeof (j) === "undefined") {
                m = i % this._m;
                n = Math.floor(i / this._m);
            } else {
                m = i;
                n = j;
            }
            context.drawImage(this._image,
                n * this._spriteWidth, m * this._spriteHeight,
                this._spriteWidth, this._spriteHeight,
                x, y, width, height);
        }

    }
    /**
     * The Easing namespace provides functions for animation easings.
     * Each function maps a unit interval representing a period of
     * time, on to another (mostly) unit interval represening the
     * change in some property (e.g., between two x coordinates).
     * @memberof Theatro
     * @namespace Theatro.Easing
     */
    var Easing = {
        /**
         * Elastic easing.
         * @memberof Theatro.Easing
         * @method Theatro.Easing.elastic
         * @param t {Number} Time (from 0 to 1)
         * @return {Number}  <code>sin(t * 4 * pi) * (1 - t)</code>
         */
        elastic: function (t) {
            return Math.sin(t * 4 * Math.PI) * (1 - t);
        },
        /**
         * Sine easing.
         * @memberof Theatro.Easing
         * @method Theatro.Easing.sine
         * @param t {Number} Time (from 0 to 1)
         * @return {Number}  <code>sin(t * 2 * pi)</code>
         */
        sine: function (t) {
            return Math.sin(t * 2 * Math.PI);
        },
        /**
         * Cosine easing.
         * @memberof Theatro.Easing
         * @method Theatro.Easing.cosine
         * @param t {Number} Time (from 0 to 1)
         * @return {Number}  <code>cos(t * 2 * pi)</code>
         */
        cosine: function (t) {
            return Math.cos(t * 2 * Math.PI);
        }
    }

}

if (window.addEventListener) { // W3C standard
    window.addEventListener('load', Theatro.getRequestAnimationFrame, false);
}
else if (window.attachEvent) { // Microsoft
    window.attachEvent('onload', Theatro.getRequestAnimationFrame);
}

function log(message) {
    console.log(message);
}
