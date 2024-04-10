class AddProviderToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :provider, :integer
  end
end
