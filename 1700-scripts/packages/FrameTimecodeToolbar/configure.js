function configure(packageFolder, packageName) {
  if (about.isPaintMode())
    return;



  var customToolToolbar = new ScriptToolbarDef({
        id: "com.jonathanfontaine.FrameTimecodeToolbar",
        text: "Frame Timecode Toolbar",
        customizable: true,
        floatable : true,
        
      });
/*
    customToolToolbar.addButton({
          text: "Frame timecode Toolbar button",
          icon: "showTimecode.png",
          checkable: false,
          action: "frameToolBar in ./FrameToolBar.js",
        });
        */
      ScriptManager.addToolbar(customToolToolbar);    
      //MessageLog.trace("frame toolbar loaded");
      require("./FrameToolBar.js").frameToolBar();
      
}


exports.configure = configure;
