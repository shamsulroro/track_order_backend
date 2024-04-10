class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :email
      t.string :access_token
      t.string :refresh_token
      t.datetime :token_expiry
      t.text :auth_client

      t.timestamps
    end
  end
end
