import Mustache from 'mustache';

export default function(template, user) {
  var obj = {
    recipient: user.userProfile
  };

  return Mustache.render(template, obj);
}
