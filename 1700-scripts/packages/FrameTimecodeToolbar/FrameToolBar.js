function frameToolBar(){



      function getTimecode(currentFrame){
        
           var fps = scene.getFrameRate();
           var currentFrame = currentFrame;
           var SS = Math.floor(currentFrame / fps);
           var MM = Math.floor(SS / 60);
           var HH = Math.floor(MM / 60);
           var FF = currentFrame - (SS * fps);
       
           function pad(str, width, what, left) {
               str = String(str);
               what = String(what);
               var w = width - str.length;
       
               if (left) {
                   return (new Array(w + 1)).join(what) + str;
               } else {
                   return str + (new Array(w + 1)).join(what);
               }
           }
       
           var i,
               timecode = [HH, MM, SS, FF];
       
           for (i = 0; i < timecode.length; i += 1) {
               timecode[i] = pad(timecode[i], 2, 0, true);
           }
       
           var resultString = timecode.join(':'); // HH:MM:SS:FF
           return resultString;
         }
         
      
      var widgets = QApplication.allWidgets();
      var toolbar = widgets.filter(function(x) {
        return x.objectName == "Frame_Timecode_Toolbar"
      })[0]
      toolbar.clear();
      toolbar.floatable =true;
      //MessageLog.trace(toolbar.clear());

     //var toolbar = new QToolBar()
     
     var frameLabel = new QLabel()
     frameLabel.text = "  Fr "+frame.current();
     frameLabel.setStyleSheet("Font : 11pt; font-weight:bold;  color:#aaa;");
     //frameLabel.clicked.connect(function(){toolbar.hide()})
     
     var timeCodeLabel = new QLabel()
     timeCodeLabel.text = "   "+getTimecode(frame.current())+"  ";
     timeCodeLabel.setStyleSheet("Font : 10pt; font-weight:bold;  color:#aaa;");
     //timeCodeLabel.clicked.connect(function(){toolbar.hide()})
 
     
     toolbar.addWidget(frameLabel);
     toolbar.addWidget(timeCodeLabel);
     //toolbar.show();
     var scn = new SceneChangeNotifier(frameLabel);
     scn.currentFrameChanged.connect( function(){
              frameLabel.text = "  Fr "+frame.current();
              timeCodeLabel.text = "   "+getTimecode(frame.current())+"  ";
           });
 
      
           
      //toolbarHolder.addToolBar(toolbar);

  
}

exports.frameToolBar = frameToolBar;
