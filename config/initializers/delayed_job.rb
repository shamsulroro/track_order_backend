Delayed::Worker.logger = Logger.new(File.join(Rails.root, 'log', 'delayed_job.log'))
Delayed::Worker.max_attempts = 5
Delayed::Worker.max_run_time = 60.minutes