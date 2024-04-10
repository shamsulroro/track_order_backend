class CreateDevices < ActiveRecord::Migration[7.1]
  def change
    create_table :devices do |t|
      t.string :platform
      t.string :token
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
