function FastEllipseName() {
  return "com.jonathanfontaine.FastEllipse";
}

function registerFastEllipse(packageFolder) {
  System.println("Registering : " + __file__);
  System.println(System.getenv("HOME"));

  Tools.registerTool({
    name: FastEllipseName(),
    displayName: "Fast Ellipse",
    icon: "circle.png",
    toolType: "scenePlanning",
    canBeOverridenBySelectOrTransformTool: true,
    options: {
      fromCenter: true,
      thickness: 10,
      fill: false,
    },
    resourceFolder: "resources",
    preferenceName: function() {
      return this.name + ".settings";
    },
    defaultOptions: {
      fromCenter: true,
      thickness: 10,
      fill: false,
    },
    loadFromPreferences: function() {
      try {
        var v = preferences.getString(this.preferenceName(), JSON.stringify(
          this.defaultOptions));
        this.options = JSON.parse(v);
      } catch (e) {
        this.options = this.defaultOptions;
      }
    },
    storeToPreferences: function() {
      preferences.setString(this.preferenceName(), JSON.stringify(this.options));
    },
    onRegister: function() {
      // This is called once when registering the tool
      // Here the developer can, for example, initialize the tool options
      // from the preferences
      System.println("Registered tool : " + this.resourceFolder);
      this.loadFromPreferences();
    },
    onCreate: function(ctx) {
      // This is called once for each instance in a view
      // The context could be populated with instance data
      ctx.alt = false;
    },
    onMouseDown: function(ctx) {

      var settings = Tools.getToolSettings();
      MessageLog.trace(JSON.stringify(ctx))

      // keys variables
      ctx.alt = KeyModifiers.IsAlternatePressed();
      ctx.shift = KeyModifiers.IsShiftPressed();
      ctx.ctrl = KeyModifiers.IsControlPressed();
      ctx.space = KeyModifiers.IsSpacePressed();

      //mouse variable
      ctx.origin = ctx.currentPoint;

      //transformation variable
      ctx.rotationPivot = [{
        x: 0,
        y: 0
      }];
      ctx.oldangle = 0;

      //drawing ellipse variables
      ctx.circleCenter = [{
        x: 0,
        y: 0
      }];
      ctx.angle = 0;
      //radius
      ctx.rx = 10;
      ctx.ry = 20;
      ctx.ratio = .5;


      return true;
    },
    onMouseMove: function(ctx) {
      ctx.alt = KeyModifiers.IsAlternatePressed();
      ctx.shift = KeyModifiers.IsShiftPressed();
      ctx.ctrl = KeyModifiers.IsControlPressed();
      ctx.space = KeyModifiers.IsSpacePressed();
      if (!ctx.space) {

        //  if(this.options.fromCenter) {

        //    if(!ctx.alt) this.buildCircleFromCenter(ctx, ctx.currentPoint);
        //    if(ctx.alt) this.rotateCircle(ctx, ctx.currentPoint);

        //  } else {

        if (!ctx.alt) this.buildCircleWithAngle(ctx, ctx.currentPoint);
        if (ctx.alt) this.ajdustCircleWidth(ctx, ctx.currentPoint);
        //  }
      } else {

        this.moveCircle(ctx, ctx.currentPoint);
      }

      this.updateCircleAndOVerlay(ctx);

      return true;
    },
    onMouseUp: function(ctx) {
      //MessageLog.trace("On mouse up");


      var settings = Tools.getToolSettings();
      var success = true;
      scene.beginUndoRedoAccum("Circle tool");
      try {
        if (!settings.currentDrawing) {
          settings = Tools.createDrawing();
          if (!settings)
            success = false;
        }

        if (success && settings.currentDrawing) {
          var cid = PaletteManager.getCurrentColorId();
          //this.buildCircle(ctx, ctx.currentPoint, 1, false);

          var layerData = [{
            index: 1,
            shaders: [],
            strokes: [{
              path: ctx.poly,
              pencilColorId: cid,
              thickness: {
                minThickness: 0,
                maxThickness: this.options.thickness,
                thicknessPath: 0
              }
            }]
          }];

          if (this.options.fill) {
            layerData[0].contours = [{
              path: ctx.poly,
              colorId: cid,
              thickness: this.options.thickness,
            }]
          }


          DrawingTools.createLayers({
            label: "Circle tool",
            drawing: settings.currentDrawing,
            art: 2,
            layers: layerData
          });



        } else {
          success = false;
        }
      } catch (e) {
        System.println("Exception: " + e);
        success = false;
      }
      ctx.overlay = {};

      if (success)
        scene.endUndoRedoAccum();
      else
        scene.cancelUndoRedoAccum();
      return success;

    },
    onResetTool: function(ctx) {
      ctx.overlay = {};
    },
    loadPanel: function(dialog, responder) {
      var uiFile = this.resourceFolder + "/fasterEllipseTool.ui";
      System.println("UIfilename:" + uiFile);
      try {
        var ui = UiLoader.load({
          uiFile: uiFile,
          parent: dialog,
          folder: this.resourceFolder
        });

        this.ui = ui;

        ui.options.thickness.setValue(this.options.thickness);
        ui.options.thickness['valueChanged(int)'].connect(this, function(
          v) {
          this.options.thickness = v;
          //MessageLog.trace("thickness changed" + v);
          this.storeToPreferences();
        });

        ui.options.fill.setChecked(this.options.fill);
        ui.options.fill.icon = new QIcon(this.resourceFolder + "/ellipse_fill.png");
        // ui.options.fill.icon = new QIcon("ellipse_fill.png");
        ui.options.fill['toggled(bool)'].connect(this, function(v) {
          this.options.fill = v;
          //MessageLog.trace("fill changed " + v);
          this.storeToPreferences();
        });

  //      ui.options.mod.hide();

        // ui.options.mod.setChecked(this.options.fromCenter);
        // ui.options.mod.icon = new QIcon(this.resourceFolder + "/ellipse_mode1.png");
        // ui.options.mod['toggled(bool)'].connect(this, function(v) {
        //   this.options.fromCenter = v;
        //   this.storeToPreferences();
        // });


      } catch (e) {
        System.println("Exception: " + e);
      }
      System.println("Loaded panel");

    },
    refreshPanel: function(dialog, responder) {
      // In here, the panel could react to changes in the selection or other external sources
      System.println("Refresh panel");
    },
    builCircleFromBoundingBox: function() {
      // drawing from bounding box
      /// mode3
      /*
              ctx.poly = Drawing.geometry.createCircle({
                       x : ctx.origin.x -( rx*offsetx),
                       y : ctx.origin.y -( ry*offsety),
                       radiusX : rx/2+rx*Math.abs(offsety),
                       radiusY : ry/2+ry*Math.abs(offsetx)
                    });
                    ctx.rotationOrigin =[{
                      x:ctx.origin.x,
                      y:ctx.origin.x,
                      }]
      */
    },

    rotate2D: function(cx, cy, x, y, angle) {
      //var radians = (Math.PI / 180) * angle;
      var radians = angle;
      var cos = Math.cos(radians);
      var sin = Math.sin(radians);
      var nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
      var ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
      var rotated = [nx, ny];
      return rotated;
    },
    rotate2DPoly: function(poly, pivot, angle) {

      for (var i = 0; i < poly.length; i++) {
        var rotated = this.rotate2D(pivot.x, pivot.y, poly[i].x, poly[i].y,
          angle);
        poly[i].x = rotated[0];
        poly[i].y = rotated[1];
      }
      return poly;
    },
    rotateCircle: function(ctx, pt) {
      //var poly = ctx.poly;

      var dx = (pt.x - ctx.origin.x);
      var dy = (pt.y - ctx.origin.y);

      var angle = Math.atan2(dx, dy);
      while (angle < 0) angle += Math.PI * 2

      ctx.angle = angle;


    },
    buildCircleFromCenter: function(ctx, pt) {
      //var r = this.options.radius;
      var dx = (pt.x - ctx.origin.x);
      var dy = (pt.y - ctx.origin.y);
      //radius
      var rx = Math.abs(dx);
      var ry = Math.abs(dy);

      ctx.circleCenter.x = ctx.origin.x;
      ctx.circleCenter.y = ctx.origin.y;
      ctx.rotationPivot = ctx.origin;
      ctx.rx = rx;
      ctx.ry = ry;


    },
    ajdustCircleWidth: function(ctx, pt) {
      //var r = this.options.radius;
      var dx = (pt.x - ctx.origin.x);
      var dy = (pt.y - ctx.origin.y);
      var distance = Math.sqrt(dx * dx + dy * dy);
      var d = distance - ctx.ry * 2
      ctx.rx = ctx.ry * ctx.ratio - d;
      if (ctx.shift) {
        ctx.ratio = 1;
        ctx.rx = ctx.ry;
      }
      //Array.from
      ctx.circleCenter.x = ctx.origin.x;
      ctx.circleCenter.y = ctx.origin.y + ctx.ry;
      ctx.rotationPivot.x = ctx.origin.x;
      ctx.rotationPivot.y = ctx.origin.y;

      //  this.updateCircleAndOVerlay(ctx);

    },
    buildCircleWithAngle: function(ctx, pt) {
      //var r = this.options.radius;
      var dx = (pt.x - ctx.origin.x);
      var dy = (pt.y - ctx.origin.y);

      if (ctx.ry != 0) ctx.ratio = ctx.rx / ctx.ry;
      if (ctx.shift) ctx.ratio = 1;

      var distance = Math.abs(Math.sqrt(dx * dx + dy * dy));
      ctx.ry = distance / 2;
      ctx.rx = ctx.ry * ctx.ratio;

      ctx.angle = Math.atan2(dx, dy);
      while (ctx.angle < 0) ctx.angle += Math.PI * 2


      ctx.circleCenter.x = ctx.origin.x;
      ctx.circleCenter.y = ctx.origin.y + ctx.ry;
      ctx.rotationPivot.x = ctx.origin.x;
      ctx.rotationPivot.y = ctx.origin.y;



    },
    moveCircle: function(ctx, pt) {
      var dx = (pt.x - ctx.origin.x);
      var dy = (pt.y - ctx.origin.y);

      //var distance = Math.abs(Math.sqrt(dx * dx + dy * dy));
      //ctx.ry = distance/2;
      //ctx.rx =   ctx.ry * ctx.ratio;
      var hyp = ctx.ry * 2;
      var offsetx = hyp * Math.sin(ctx.angle);
      var offsety = hyp * Math.cos(ctx.angle);

      ctx.origin.x = pt.x - offsetx;
      ctx.origin.y = pt.y - offsety;

      ctx.circleCenter.x = pt.x - offsetx / 2;
      ctx.circleCenter.y = pt.y - offsety / 2;
      ctx.rotationPivot.x = pt.x - offsetx / 2;
      ctx.rotationPivot.y = pt.y - offsety / 2;


    },



    updateCircleAndOVerlay: function(ctx) {

      ctx.poly = Drawing.geometry.createCircle({
        x: ctx.circleCenter.x,
        y: ctx.circleCenter.y,
        radiusX: ctx.rx,
        radiusY: ctx.ry
      });

      ctx.poly = this.rotate2DPoly(ctx.poly, ctx.rotationPivot, ctx.angle)
      var polyd = ctx.poly;
      polyd = Drawing.geometry.discretize({
        precision: 100,
        path: polyd
      });
      ctx.overlay = {
        paths: [{
          path: polyd,
          color: {
            r: 0,
            g: 0,
            b: 255,
            a: 255
          }
        }]
      }
    }


  });



}

exports.toolname = FastEllipseName();
exports.registerTool = registerFastEllipse;
