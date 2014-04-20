Meteor.methods({
  'html2jade': function (html, mcheck) { 
    
    Future = Meteor.require('fibers/future')
    Meteor.require('contextify')
    
    var html2jade = Meteor.require('html2jade')
    var fut = new Future()
    
    html2jade.convertHtml(html, {double: true, doNotEncode: true}, function (err, jade) {
      if (mcheck) {
        jade = new JadeBlock(html, jade)
        fut.return(jade.filterHandlebars())
      } else {
        fut.return(jade)
      }      
    })
    
    return fut.wait()
  }
})

function JadeBlock(html, jade) {
  this.html = html
  this.jade = jade
}

JadeBlock.prototype.filterHandlebars = function (){
  var jade = this.jade.match(/[^\r\n]+/g),
      paddings = [],
      result = ''
  
  // Remove extra html/body tags & preceding 4 spaces
  if (this.html.indexOf('<html>') === -1) {
    jade.splice(0, 2) // Remove html & body
    _.each(jade, function (e, i, arr) {
      
      arr[i] = e.substring(4, e.length)
    })    
  }
  
  _.each(jade, function (line){
    var newLine = new JadeLine(line, jade)
    result += newLine.preProcess()
                      .closeTag()
                      .elseTag()
                      .openTag()
                      .embedTemplateTag()  
                      .postProcess()
                      .line
  })
  
  return result
}

function JadeLine(line, jade) {
  this.line = line   
  this.jade = jade 
}

JadeLine.prototype.preProcess = function (){
  return this  
}

JadeLine.prototype.openTag = function (){  
  if (this.line.indexOf('{{#') > -1) {
    var p1 = this.line.indexOf('#'),
        p2 = this.line.indexOf(' ', p1)
    this.tag = this.line.substring(p1+1, p2)
    this.line = this.line.replace('| {{#', '')
                         .replace('}}','')
  }
  return this
}

JadeLine.prototype.closeTag = function (){
  if (this.line.indexOf('{{/')  > -1) {
    var p1 = this.line.indexOf('/'),
        p2 = this.line.indexOf(' ', p1)
    this.tag = this.line.substring(p1+1, p2)
    this.line = ''
  }
  return this
}

JadeLine.prototype.elseTag = function (){
  if (this.line.indexOf('{{else}}')  > -1) {
    this.line = this.line.replace('| {{','')
                          .replace('}}','')
  }
  return this
}

JadeLine.prototype.embedTemplateTag = function (){
  if (this.line.indexOf('| {{&#62; ') > -1) {    
    this.line = this.line.replace('| {{&#62; ', '+')
                          .replace('}}','')
  }
  return this
}

JadeLine.prototype.postProcess = function (){
  if (this.line.length) {
    this.line = this.line + '\r\n'
  }
  return this
}
