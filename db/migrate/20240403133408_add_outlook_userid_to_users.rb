class AddOutlookUseridToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :outlook_userid, :string
  end
end
