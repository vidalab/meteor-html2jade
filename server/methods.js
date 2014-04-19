Meteor.methods({
  'html2jade': function (html, mcheck) { 
    
    Future = Meteor.require('fibers/future')
    
    var html2jade = Npm.require('html2jade');
    var fut = new Future()
    
    html2jade.convertHtml(html, {}, function (err, jade) {
      fut.return(jade)
    })
    
    return fut.wait()
  }
})