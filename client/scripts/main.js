// On page create
document.addEventListener('DOMContentLoaded', function () {
  
        // Remove dual scrollbars
        $('html').css('overflow', 'hidden');
        // Load particles (particles div tag)
        particleground(document.getElementById('particles'), {
          dotColor: '#fff',
          lineColor: '#fff'
        });
        // Load intro (intro div tag)
        var intro = document.getElementById('intro');
        intro.style.marginTop = - intro.offsetHeight / 2 + 'px';


    }, false);
          