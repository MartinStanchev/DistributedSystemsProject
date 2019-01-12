var url_string = window.location.href;
var url = new URL(url_string);
var repo = url.searchParams.get("repo");

function ContinuousForceDirectedLayout() {
  go.ForceDirectedLayout.call(this);
  this._isObserving = false;
}
go.Diagram.inherit(ContinuousForceDirectedLayout, go.ForceDirectedLayout);
/** @override */
ContinuousForceDirectedLayout.prototype.isFixed = function(v) {
  return v.node.isSelected;
};
// optimization: reuse the ForceDirectedNetwork rather than re-create it each time
/** @override */
ContinuousForceDirectedLayout.prototype.doLayout = function(coll) {
  if (!this._isObserving) {
    this._isObserving = true;
    // cacheing the network means we need to recreate it if nodes or links have been added or removed or relinked,
    // so we need to track structural model changes to discard the saved network.
    var lay = this;
    this.diagram.addModelChangedListener(function(e) {
      // modelChanges include a few cases that we don't actually care about, such as
      // "nodeCategory" or "linkToPortId", but we'll go ahead and recreate the network anyway.
      // Also clear the network when replacing the model.
      if (
        e.modelChange !== "" ||
        (e.change === go.ChangedEvent.Transaction &&
          e.propertyName === "StartingFirstTransaction")
      ) {
        lay.network = null;
      }
    });
  }
  var net = this.network;
  if (net === null) {
    // the first time, just create the network as normal
    this.network = net = this.makeNetwork(coll);
  } else {
    // but on reuse we need to update the LayoutVertex.bounds for selected nodes
    this.diagram.nodes.each(function(n) {
      var v = net.findVertex(n);
      if (v !== null) v.bounds = n.actualBounds;
    });
  }
  // now perform the normal layout
  go.ForceDirectedLayout.prototype.doLayout.call(this, coll);
  // doLayout normally discards the LayoutNetwork by setting Layout.network to null;
  // here we remember it for next time
  this.network = net;
};
var app = new Vue({
  el: "#new",
  data: {
    id: "",
    nodedata: [],
    di: [],
    Classes: [],
    SuperClass: "",
    classExtends: [],
    linkdata: [],
    comments: [],
    user: [],
    comment_diagram: ""
  },
  methods: {
    hideModal: function() {
      $("#myModal").removeClass("in");
      $(".modal-backdrop").remove();
      $("body").removeClass("modal-open");
      $("body").css("padding-right", "");
      $("#myModal").hide();
    },
    getRepo: function() {
      window.location.href = "/uml.html?repo=" + repo;
    },
    // uml1 for the uml old page
    getRepoUml: function() {
      window.location.href = "/NewUml.html?repo=" + repo;
    },
      
      homePage: function() {
        const query = window.location.search.substring(1)
            const token = query.split('access_token=')[1]
            window.location.href = "/profile.html?access_token="+token;  
    },
    
    getUmlData: function() {
      axios
        .get("api/diagrams/" + repo)
        .then(response => {
          this.nodedata = response.data.data;

          if (response.data.data.length > 0) {

            for (var t = 0; t < response.data.data[0].comments.length; t++) {
              this.comments.push(response.data.data[0].comments[t]);
            }

            // get the response from the data base and loop through its length,
            for (var j = 0; j < response.data.data.length; j++) {
              for (var i = 0; i < response.data.data[j].Classes.length; i++) {
                var data = {
                  key: response.data.data[j].Classes[i].name,
                  text: response.data.data[j].Classes[i].name,
                  id: response.data.data[j].Classes[i]._id,
                  repoID: response.data.data[j]._id,
                  properties: response.data.data[j].Classes[i].properties
                };
                myDiagram.model.addNodeData(data);
              }
            }

            // defines conecteds classes
            for (var a = 0; a < response.data.data.length; a++) {
              for (
                var b = 0;
                b < response.data.data[a].classConecteds.length;
                b++
              ) {
                if (
                  response.data.data[a].classConecteds[b].relationship ==
                  "generalization"
                ) {
                  myDiagram.model.addLinkData(
                    response.data.data[a].classConecteds[b]
                  );
                }
              }
            }
          }
        })
        .catch(error => {
          console.log(error);
        });
    },

    saveChange: function(e) {
      axios
        .patch("/api/diagram/" + repo, {
          Classes: myDiagram.model.nodeDataArray,
          classConecteds: myDiagram.model.linkDataArray
        })
        .then(response => {
          //this.getUmlData();
          console.log("data is succefuly updated " + response.status);
        })
        .catch(err => {
          window.alert("Sorry! You dont have authorization to make changes.");
          console.log(err);
        });
    },
    queryGitUser: function() {
      const query = window.location.search.substring(1);
      const token = query.split("access_token=")[1];
      fetch("https://api.github.com/user", {
        headers: {
          Authorization: "token " + token
        }
      })
        .then(res => res.json())
        .then(res => {
          this.user = res;
        });
    },
    addComment: function() {
      let co = {
        userName: this.user.login,
        comment: this.comment_diagram,
        userImage: this.user.avatar_url
      };
      axios
        .patch("/api/diagram/add/" + repo, co)
        .then(response => {
          location.reload();
          console.log(response);
        })
        .catch(error => {
          window.alert("Sorry! You dont have authorization to add a comment.");
          console.log(error);
        });
    },
    reload: function() {
      //myDiagram.layout.network = null;
      var text = myDiagram.model.toJson();
      myDiagram.model = go.Model.fromJson(text);
      // myDiagram.layout = go.GraphObject.make(
      //   ContinuousForceDirectedLayout, // automatically spread nodes apart while dragging
      //   { defaultSpringLength: 30, defaultElectricalCharge: 100 }
      // );
    },

    init: function() {
      if (window.goSamples) goSamples(); // init for these samples -- you don't need to call this
      var $ = go.GraphObject.make; // for conciseness in defining templates
      myDiagram = $(
        go.Diagram,
        "myDiagramDiv", // must name or refer to the DIV HTML element
        {
          initialAutoScale: go.Diagram.Uniform, // an initial automatic zoom-to-fit
          contentAlignment: go.Spot.Center, // align document to the center of the viewport
          layout: $(
            ContinuousForceDirectedLayout, // automatically spread nodes apart while dragging
            { defaultSpringLength: 30, defaultElectricalCharge: 150 }
          ),
          // do an extra layout at the end of a move
          SelectionMoved: function(e) {
            e.diagram.layout.invalidateLayout();
          }
        }
      );
      // dragging a node invalidates the Diagram.layout, causing a layout during the drag
      myDiagram.toolManager.draggingTool.doMouseMove = function() {
        go.DraggingTool.prototype.doMouseMove.call(this);
        if (this.isActive) {
          this.diagram.layout.invalidateLayout();
        }
      };
      // define each Node's appearance
      myDiagram.nodeTemplate = $(
        go.Node,
        "Auto", // the whole node panel
        // define the node's outer shape, which will surround the TextBlock
        $(go.Shape, "Circle", {
          fill: "CornflowerBlue",
          stroke: "black",
          spot1: new go.Spot(0, 0, 5, 5),
          spot2: new go.Spot(1, 1, -5, -5)
        }),
        $(
          go.TextBlock,
          {
            font: "bold 10pt helvetica, bold arial, sans-serif",
            textAlign: "center",
            maxSize: new go.Size(200, NaN)
          },
          new go.Binding("text", "text")
        )
      );
      // the rest of this app is the same as samples/conceptMap.html
      // replace the default Link template in the linkTemplateMap
      myDiagram.linkTemplate = $(
        go.Link,
        $(
          // the whole link panel
          go.Shape, // the link shape
          { stroke: "black" }
        ),
        $(
          go.Shape, // the arrowhead
          { toArrow: "standard", stroke: null }
        ),
        $(
          go.Panel,
          "Auto",
          $(
            go.Shape, // the label background, which becomes transparent around the edges
            {
              fill: $(go.Brush, "Radial", {
                0: "rgb(240, 240, 240)",
                0.3: "rgb(240, 240, 240)",
                1: "rgba(240, 240, 240, 0)"
              }),
              stroke: null
            }
          ),
          $(go.TextBlock, {
            textAlign: "center",
            font: "5pt helvetica, arial, sans-serif",
            stroke: "black",
            margin: 4,
            text: "extandes"
          })
        )
      );
      // new go.Binding("text", "text") // the label text

      myDiagram.model = $(go.GraphLinksModel, {
        nodeDataArray: this.nodedata,
        linkDataArray: this.linkdata
      });
      //myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
    },
    refreshDiagram : function() {
      myDiagram.clear();
      this.getUmlData()
    },

     connectSocket: function() {
      var socket = io();
      socket.on('updateDiagram', this.refreshDiagram);
    }
  },

  mounted() {
    this.connectSocket();
    waitingDialog.show("Loading", {
      dialogSize: "sm",
      progressType: "warning"
    });

    this.getUmlData();
    this.queryGitUser();
    this.init();

    setTimeout(function() {
      if(myDiagram.model.nodeDataArray.length == 0 && myDiagram.model.linkDataArray.length == 0){
      }
      else{
        waitingDialog.hide();
      }
      }, 1000);
    setTimeout(function() {
      if(myDiagram.model.nodeDataArray.length == 0 && myDiagram.model.linkDataArray.length == 0){
        'getUmlData()';
      }
      else{
        waitingDialog.hide();
      }    }, 2000);
    setTimeout(function() {
      if(myDiagram.model.nodeDataArray.length == 0 && myDiagram.model.linkDataArray.length == 0){    
      }
      else{
        waitingDialog.hide();
      }    }, 3000);
    setTimeout(function() {
      if(myDiagram.model.nodeDataArray.length == 0 && myDiagram.model.linkDataArray.length == 0){
      }
      else{
        waitingDialog.hide();
      }    }, 4000);
    setTimeout(function() {
      if(myDiagram.model.nodeDataArray.length == 0 && myDiagram.model.linkDataArray.length == 0){
        'getUmlData()';      
      }
      else{
        waitingDialog.hide();
      }    }, 5000);
    setTimeout(function() {
      if(myDiagram.model.nodeDataArray.length == 0 && myDiagram.model.linkDataArray.length == 0){
      }
      else{
        waitingDialog.hide();
      }    }, 6000);
    setTimeout(function() {
      if(myDiagram.model.nodeDataArray.length == 0 && myDiagram.model.linkDataArray.length == 0){
        window.alert("One of the main node in the system is disabled or crashed! please enable it before refreshing the page.");
        waitingDialog.hide();
      }
      }, 7000);
  }
});