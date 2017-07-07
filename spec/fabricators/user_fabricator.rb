Fabricator(:user) do
  email { sequence(:email) { |i| "bruce#{i}@wayne.com" } }
  password 'myawesomepassword'
  ip_address { sequence(:ip_address) { |i| "99.232.23.#{i%254}"} }
  active true
end

Fabricator(:admin, from: :user) do
  email { sequence(:email) {|i| "admin#{i}@talon.rip"} }
  admin true
end

Fabricator(:joker, from: :user) do
  email 'joker@arkham.com'
  password 'mymoreawesomepassword'
end

Fabricator(:shadow, from: :user) do
  email nil
  password nil
  active false
  shadow true
end
