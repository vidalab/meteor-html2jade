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
      result = ''
  
  // Remove extra html/body tags & preceding 4 spaces
  if (this.html.indexOf('<html>') === -1) {
    jade.splice(0, 2) // Remove html & body
    _.each(jade, function (e, i, arr) {
      
      arr[i] = e.substring(4, e.length)
    })    
  }
  
  var level = 0
  _.each(jade, function (line){
    var newLine = new JadeLine(line, level)
    result += newLine.preProcess()
                      .tagFilters() 
                      .postProcess()
                      .line
    level = newLine.newLevel                    
  })
  
  return result
}

function JadeLine(line, level) {
  this.line = line   
  this.level = level 
  this.newLevel = level
}

JadeLine.prototype.preProcess = function (){
  return this  
}

JadeLine.prototype.tagFilters = function (){
  
  if (this.line.indexOf('| {{#') > -1) {
    // Open tag
    var p1 = this.line.indexOf('#'),
        p2 = this.line.indexOf(' ', p1)
    this.tag = this.line.substring(p1+1, p2)
    this.newLevel += 1
    this.line = this.line.replace('| {{#', '')
                         .replace('}}','')
  } else if (this.line.indexOf('| {{/')  > -1) {
    // Close tag
    var p1 = this.line.indexOf('/'),
        p2 = this.line.indexOf(' ', p1)
    this.tag = this.line.substring(p1+1, p2)
    this.newLevel -= 1
    this.line = ''
  } else if (this.line.indexOf('| {{else}}')  > -1) {
    // else tag
    this.line = this.line.replace('| {{','')
                          .replace('}}','')
  } else if (this.line.indexOf('| {{&#62; ') > -1) {    
    // Embed template tag
    this.line = this.line.replace('| {{&#62; ', '+')
                          .replace('}}','')
  }
  
  return this
}

JadeLine.prototype.postProcess = function (){
  if (this.level) {    
    this.padLine()
  }
  if (this.line.length) {
    this.line = this.line + '\r\n'
  }
  return this
}

JadeLine.prototype.padLine = function () {
  var level = this.level
  while (level-- > 0) {
    this.line = '  ' + this.line
  }
}
