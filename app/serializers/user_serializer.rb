class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :admin, :suspended, :active, :shadow, :gravatar_template
end
