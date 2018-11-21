<!-- baserouter.vue -->
<template>
  <div>
    <!-- This is our header. Just a Jumbotron with some static info and a navigation bar -->

    <div class="jumbotron text-center w-75 mx-auto"> 
      <nav class="navbar navbar-expand-sm bg-light navbar-light">
        <ul class="navbar-nav">
        </ul>
      </nav>
    </div>
  
    <!-- This is our footer -->
    <div class="row">
      <!-- The empty col-2 here are just used as a placeholder on the right and left -->

      <!-- Router view is where we will mount our dynamic content -->
      <div class="col-sm-12 centered">
        <router-view></router-view>
      </div>
  
    </div>
  
  <!-- This is our footer -->
  <div class="jumbotron text-center w-75 mx-auto " style="margin-bottom:0">
  </div>
</div>
</template>

<script>
  module.exports = {
    name:"BaseRouter"
  };
</script>