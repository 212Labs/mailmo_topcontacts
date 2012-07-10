render_results = function(data) {
  var results = data["results"];
  results.sort(function(a,b) { return b["value"] - a["value"]; })
  
  // Top answer is probably your own email
  results = results.slice(1, 12)
  var data = results.map(function(item, index) { return [item["value"], index]; })
  var labels = results.map(function(item, index) { return [index, item["_id"]]; })
  
  $.plot($("#content"), [
        {
            data: data,
            bars: { show: true },
      
        }],
        {   series: { bars : { horizontal : true , align: "center", barWidth : 0.9} },
            yaxis: { ticks: labels }
        });
}
  
  
$(function() {
  
  // First, parse the query string
  var params = {};
  var queryString = location.hash.substring(1);
  var regex = /([^&=]+)=([^&]*)/g;
  var m;
  
  while (m = regex.exec(queryString)) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }
  
  if ("token" in params) {
    // Authenticated!  
    
    // Should remove hash
    window.location.hash = '';
    
    var map = 
      "function() {" +
      "  var emitAddress = function(address) {" +
      "    emit(address.email, 1);" +
      "  };" +
      "  emitAddress(this.addresses.from);" +
      "  this.addresses.to.forEach(emitAddress);" +
      "  this.addresses.cc.forEach(emitAddress);" +
      "  this.addresses.bcc.forEach(emitAddress);" +
    	"}";
    
    var reduce = 
      "function(email, counts) {" +
      "  var result = 0;" +
      "  for(var count in counts) {" +
      "    result += parseInt(count); " +
      "  }" +
      "  return result; " +
      "}";
    
    var lastMonth = Math.round(((new Date()).getTime() / 1000) - (30 * 24 * 60 * 60))
    
    var data =  { 
      "access_token" :  params["token"],
      "map" : map,
      "reduce" : reduce,
      "query" : { "date" : { "$gt" : lastMonth }}};
        
    $.ajax({
      url : 'https://mailmo.at/api/mapreduce',
      type : "POST",
      crossDomain : true,
      contentType: 'application/json',
      data : JSON.stringify(data),
      dataType : 'json',
      success : render_results});
    
  } else {
    // Redirect to Mailmo!
    var auth_params = {
      consumer_key : '818f2f29-72d6-4e4f-a553-170c9ea115ce',
      redirect : window.location.href.split('#')[0],
      response_type : 'token',
      state : 'asdfasdfsdf',
    }; 
    
    window.location.replace("https://mailmo.at/authorize?" + $.param(auth_params));
  }
});