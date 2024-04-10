class CreateSubscriptions < ActiveRecord::Migration[7.1]
  def change
    create_table :subscriptions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :expiry
      t.string :outlookid
      t.text :response

      t.timestamps
    end
  end
end
