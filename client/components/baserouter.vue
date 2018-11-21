<!-- baserouter.vue -->
<template>
  <div>
    <div class="jumbotron text-center w-75 mx-auto"> 
    <h1>Git UML</h1>

       <!--<nav class="navbar navbar-expand-sm bg-light navbar-light">
       <ul class="navbar-nav">
        </ul>
      </nav>-->
    </div>
  
    <div class="row">

      <div class="col-sm-1 centered">
      </div>
      <div class="col-sm-10 centered">
        <router-view></router-view>
      </div>
      <div class="col-sm-1 centered">
      </div>
    </div>
  
  <div class="jumbotron text-center w-75 mx-auto " style="margin-bottom:0">
        <p>Created by Team Whatever.</p>
  </div>
</div>
</template>

<script>
  module.exports = {
    name:"BaseRouter"
  };
</script>