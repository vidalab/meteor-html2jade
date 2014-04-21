METEOR_CHECK = 'meteorCheck'
var htmlCopy = null

Meteor.startup(function (){
  Session.set(METEOR_CHECK, true)  
  $('[rel="tooltip"]').tooltip({placement: 'bottom'})  
})

Template.main.events({
  'keyup #editor-html': function (e, tmpl){
    if (htmlCopy != $('#editor-html').val()) {
      convertHtml()
    }  
    e.preventDefault()
  },
  'click #meteor-check': function (e, tmpl) {
    Session.set(METEOR_CHECK, !Session.get(METEOR_CHECK))
    convertHtml()    
  }
})

Template.main.helpers({
  mcheck: function (){
    return Session.get(METEOR_CHECK)
  }
})

function convertHtml() {
  var html = $('#editor-html').val(),
      mcheck = Session.get(METEOR_CHECK)
  
  if (!html.length) return
      
  $('.flash-message.label-info').show()
  
  htmlCopy = html
  
  Meteor.call('html2jade', html, mcheck, function (err, result){
    if (!err) { 
      $('#editor-jade').val(result)
    } else {
      console.log(err)
      $('.flash-message.label-danger').show()
      setTimeout(function (){
        $('.flash-message.label-danger').hide()
      }, 3000)      
    }
    $('.flash-message.label-info').hide()
  })
}