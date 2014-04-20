METEOR_CHECK = 'meteorCheck'

Meteor.startup(function (){
  Session.set(METEOR_CHECK, true)
  $('[rel="tooltip"]').tooltip({placement: 'right'})
})

Template.main.events({
  'keyup #editor-html': function (e, tmpl){
    var html = $(e.currentTarget).val(),
        mcheck = Session.get(METEOR_CHECK)
        
    Meteor.call('html2jade', html, mcheck, function (err, result){
      if (!err) { 
        $('#editor-jade').val(result)
      } else {
      }      
    })
    
    e.preventDefault()
  },
  'click #meteor-check': function (e, tmpl) {
    var mcheck = Session.get(METEOR_CHECK)
    Session.set(METEOR_CHECK, !mcheck)
  }
})

Template.main.helpers({
  mcheck: function (){
    return Session.get(METEOR_CHECK)
  }
})