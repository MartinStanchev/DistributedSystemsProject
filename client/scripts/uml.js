var linkdata = [
  //{ from: -4, to: -5, relationship: "generalization" },
  // { from: 13, to: 11, relationship: "generalization" },
  // { from: 14, to: 13, relationship: "aggregation" }
];
var url_string = window.location.href ;
var url = new URL(url_string);
var repo = url.searchParams.get("repo");

var app = new Vue({
  el: "#uml",
  data: {
    id:"",
    nodedata: [],
    di: [],
    Classes: [],
    SuperClass: "",
    classExtends: [],
    linkdata: []

    // node :[],
  },
  methods: {
    
    getUmlData: function(){
      axios
        .get("/api/diagram/" + repo)
        .then(response => {
          this.id = response.data.data[0]._id;
          this.di = response.data.data[0]._id;

          // this.nodedata = response.data.data[0].Classes;
          // linkdata = response.data.data[0].classConecteds;

          myDiagram.model.addNodeData(response.data.data[0].Classes);
          myDiagram.model.addLinkData(response.data.data[0].classConecteds);


          // get the response from the data base and loop through its length,
          /*for (var j = 0; j < response.data.data.length; j++) {
            for (var i = 0; i < response.data.data[j].Classes.length; i++) {
              var data = {
                key: response.data.data[j].Classes[i],
                name: response.data.data[j].Classes[i],
                properties: [
                  { name: "classes", type: "List<Course>", visibility: "public" }
                ]
              };
              myDiagram.model.addNodeData(data);
            }
          }

          // defines extends links
          for (var k = 0; k < response.data.data.length; k++) {
            for (var e = 0; e < response.data.data[k].classExtends.length; e++) {
              var link = {
                from: response.data.data[k].classExtends[e].SubClass,
                to: response.data.data[k].classExtends[e].SuperClass,

                relationship: "generalization"
              };
              myDiagram.model.addLinkData(link);
            }
          }

          // defines conecteds classes
          for (var a = 0; a < response.data.data.length; a++) {
            for (
              var b = 0;
              b < response.data.data[a].classConecteds.length;
              b++
            ) {
              var link = {
                from: response.data.data[a].classConecteds[b].MainClass,
                to: response.data.data[a].classConecteds[b].UsedClass,
                relationship: "aggegation"
              };
              myDiagram.model.addLinkData(link);
            }
          }*/
        })

        .catch(error => {
          console.log(error);
        });
    },
    init: function() {
      var $ = go.GraphObject.make;
      myDiagram = $(go.Diagram, "myDiagramDiv", {
        initialContentAlignment: go.Spot.Center,
        "undoManager.isEnabled": true,
        layout: $(go.TreeLayout, {
          // this only lays out in trees nodes connected by "generalization" links
          angle: 90,
          path: go.TreeLayout.PathSource, // links go from child to parent
          setsPortSpot: false, // keep Spot.AllSides for link connection spot
          setsChildPortSpot: false, // keep Spot.AllSides
          // nodes not connected by "generalization" links are laid out horizontally
          arrangement: go.TreeLayout.ArrangementHorizontal
        })
      });
      // show visibility or access as a single character at the beginning of each property or method
      function convertVisibility(v) {
        switch (v) {
          case "public":
            return "+";
          case "private":
            return "-";
          case "protected":
            return "#";
          case "package":
            return "~";
          default:
            return v;
        }
      }
      // the item template for properties
      var propertyTemplate = $(
        go.Panel,
        "Horizontal",
        // property visibility/access
        $(
          go.TextBlock,
          { isMultiline: false, editable: false, width: 12 },
          new go.Binding("text", "visibility", convertVisibility)
        ),
        // property name, underlined if scope=="class" to indicate static property
        $(
          go.TextBlock,
          { isMultiline: false, editable: true },
          new go.Binding("text", "name").makeTwoWay(),
          new go.Binding("isUnderline", "scope", function(s) {
            return s[0] === "c";
          })
        ),
        // property type, if known
        $(
          go.TextBlock,
          "",
          new go.Binding("text", "type", function(t) {
            return t ? ": " : "";
          })
        ),
        $(
          go.TextBlock,
          { isMultiline: false, editable: true },
          new go.Binding("text", "type").makeTwoWay()
        ),
        // property default value, if any
        $(
          go.TextBlock,
          { isMultiline: false, editable: false },
          new go.Binding("text", "default", function(s) {
            return s ? " = " + s : "";
          })
        )
      );
      // the item template for methods
      var methodTemplate = $(
        go.Panel,
        "Horizontal",
        // method visibility/access
        $(
          go.TextBlock,
          { isMultiline: false, editable: false, width: 12 },
          new go.Binding("text", "visibility", convertVisibility)
        ),
        // method name, underlined if scope=="class" to indicate static method
        $(
          go.TextBlock,
          { isMultiline: false, editable: true },
          new go.Binding("text", "name").makeTwoWay(),
          new go.Binding("isUnderline", "scope", function(s) {
            return s[0] === "c";
          })
        ),
        // method parameters
        $(
          go.TextBlock,
          "()",
          // this does not permit adding/editing/removing of parameters via inplace edits
          new go.Binding("text", "parameters", function(parr) {
            var s = "(";
            for (var i = 0; i < parr.length; i++) {
              var param = parr[i];
              if (i > 0) s += ", ";
              s += param.name + ": " + param.type;
            }
            return s + ")";
          })
        ),
        // method return type, if any
        $(
          go.TextBlock,
          "",
          new go.Binding("text", "type", function(t) {
            return t ? ": " : "";
          })
        ),
        $(
          go.TextBlock,
          { isMultiline: false, editable: true },
          new go.Binding("text", "type").makeTwoWay()
        )
      );
      // this simple template does not have any buttons to permit adding or
      // removing properties or methods, but it could!
      myDiagram.nodeTemplate = $(
        go.Node,
        "Auto",
        {
          locationSpot: go.Spot.Center,
          fromSpot: go.Spot.AllSides,
          toSpot: go.Spot.AllSides
        },
        $(go.Shape, { fill: "lightyellow" }),
        $(
          go.Panel,
          "Table",
          { defaultRowSeparatorStroke: "black" },
          // header
          $(
            go.TextBlock,
            {
              row: 0,
              columnSpan: 2,
              margin: 3,
              alignment: go.Spot.Center,
              font: "bold 12pt sans-serif",
              isMultiline: false,
              editable: true
            },
            new go.Binding("text", "name").makeTwoWay()
          ),
          // properties
          $(
            go.TextBlock,
            "Properties",
            { row: 1, font: "italic 10pt sans-serif" },
            new go.Binding("visible", "visible", function(v) {
              return !v;
            }).ofObject("PROPERTIES")
          ),
          $(
            go.Panel,
            "Vertical",
            { name: "PROPERTIES" },
            new go.Binding("itemArray", "properties"),
            {
              row: 1,
              margin: 3,
              stretch: go.GraphObject.Fill,
              defaultAlignment: go.Spot.Left,
              background: "lightyellow",
              itemTemplate: propertyTemplate
            }
          ),
          $(
            "PanelExpanderButton",
            "PROPERTIES",
            { row: 1, column: 1, alignment: go.Spot.TopRight, visible: false },
            new go.Binding("visible", "properties", function(arr) {
              return arr.length > 0;
            })
          ),
          // methods
          $(
            go.TextBlock,
            "Methods",
            { row: 2, font: "italic 10pt sans-serif" },
            new go.Binding("visible", "visible", function(v) {
              return !v;
            }).ofObject("METHODS")
          ),
          $(
            go.Panel,
            "Vertical",
            { name: "METHODS" },
            new go.Binding("itemArray", "methods"),
            {
              row: 2,
              margin: 3,
              stretch: go.GraphObject.Fill,
              defaultAlignment: go.Spot.Left,
              background: "lightyellow",
              itemTemplate: methodTemplate
            }
          ),
          $(
            "PanelExpanderButton",
            "METHODS",
            { row: 2, column: 1, alignment: go.Spot.TopRight, visible: false },
            new go.Binding("visible", "methods", function(arr) {
              return arr.length > 0;
            })
          )
        )
      );
      function convertIsTreeLink(r) {
        return r === "generalization";
      }
      function convertFromArrow(r) {
        switch (r) {
          case "generalization":
            return "";
          default:
            return "";
        }
      }
      function convertToArrow(r) {
        switch (r) {
          case "generalization":
            return "Triangle";
          case "aggregation":
            return "Stretched";
          default:
            return "";
        }
      }
      myDiagram.linkTemplate = $(
        go.Link,
        { routing: go.Link.Orthogonal },
        new go.Binding("isLayoutPositioned", "relationship", convertIsTreeLink),
        $(go.Shape),
        $(
          go.Shape,
          { scale: 1.3, fill: "red" },
          new go.Binding("fromArrow", "relationship", convertFromArrow)
        ),
        $(
          go.Shape,
          { scale: 1.3, fill: "red" },
          new go.Binding("toArrow", "relationship", convertToArrow)
        )
      );
      myDiagram.model = $(go.GraphLinksModel, {
        copiesArrays: true,
        copiesArrayObjects: true,
        nodeDataArray: this.nodedata,
        linkDataArray: linkdata
      });
      myDiagram.addModelChangedListener(function(e) {
        if (e.isTransactionFinished) {
          var json = e.model.toJson();
          // Show the model data to the console after changing the diagram.
          console.log(JSON.stringify(JSON.parse(json),null,2));
          // add the patch request to save the changes to database
        }
      });
    }
  },/*
  beforemount() {
    this.getUmlData();
  },*/
  mounted(){

    this.getUmlData();

    this.init();
  }
});
