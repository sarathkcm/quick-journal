<script>
  import Router from "@curi/svelte/components/Router.svelte";
  import DefaultLayout from "./Layouts/Default.Layout.svelte";
  export let router;
</script>

<style>
  h1 {
    color: purple;
  }
</style>

<Router {router}>
  <DefaultLayout />
</Router>
