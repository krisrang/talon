class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :admin, :suspended, :active, :shadow
end
